---
title: Futures
---

This article demonstrates how to use `actor.Future`.

## Future.Wait/Future.Result
`Future.Wait()` or `Future.Result()` wait until a response arrives or the execution times out.
Because the actor blocks, incoming messages are stuck in the mailbox.

<img src="https://raw.githubusercontent.com/oklahomer/protoactor-go-future-example/master/docs/wait/timeline.png" style="max-width: 100%;">

```go
package main

import (
	"github.com/AsynkronIT/protoactor-go/actor"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type pong struct {
}

type ping struct {
}

type pongActor struct {
	timeOut bool
}

func (p *pongActor) Receive(ctx actor.Context) {
	// Dead letter occurs because the PID of Future process ends and goes away when Future times out
	// so the pongActor fails to send message.
	switch ctx.Message().(type) {
	case *ping:
		var sleep time.Duration
		if p.timeOut {
			sleep = 2500 * time.Millisecond
			p.timeOut = false
		} else {
			sleep = 300 * time.Millisecond
			p.timeOut = true
		}
		time.Sleep(sleep)

		ctx.Respond(&pong{})
	}
}

type pingActor struct {
	pongPid *actor.PID
}

func (p *pingActor) Receive(ctx actor.Context) {
	switch ctx.Message().(type) {
	case struct{}:
		// Output becomes somewhat like below.
		// See a diagram at https://raw.githubusercontent.com/oklahomer/protoactor-go-future-example/master/docs/wait/timeline.png
		//
		// 2018/10/13 17:03:22 Received pong message &main.pong{}
		// 2018/10/13 17:03:24 Timed out
		// 2018/10/13 08:03:26 [ACTOR] [DeadLetter] pid="nonhost/future$4" message=&{} sender="nil"
		// 2018/10/13 17:03:26 Received pong message &main.pong{}
		// 2018/10/13 17:03:28 Timed out
		// 2018/10/13 08:03:30 [ACTOR] [DeadLetter] pid="nonhost/future$6" message=&{} sender="nil"
		// 2018/10/13 17:03:30 Received pong message &main.pong{}
		future := ctx.RequestFuture(p.pongPid, &ping{}, 1*time.Second)
		// Future.Result internally waits until response comes or times out
		result, err := future.Result()
		if err != nil {
			log.Print("Timed out")
			return
		}

		log.Printf("Received pong message %#v", result)

	}
}

func main() {
	rootContext := actor.EmptyRootContext

	pongProps := actor.PropsFromProducer(func() actor.Actor {
		return &pongActor{}
	})
	pongPid := rootContext.Spawn(pongProps)

	pingProps := actor.PropsFromProducer(func() actor.Actor {
		return &pingActor{
			pongPid: pongPid,
		}
	})
	pingPid := rootContext.Spawn(pingProps)

	finish := make(chan os.Signal, 1)
	signal.Notify(finish, syscall.SIGINT)
	signal.Notify(finish, syscall.SIGTERM)

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rootContext.Send(pingPid, struct{}{})

		case <-finish:
			log.Print("Finish")
			return

		}
	}
}
```

## Future.PipeTo
When the response comes back before Future times out, the response message is sent to the PipeTo destination.
This does not block the actor so the incoming messages are executed as they come in.
If the later message's execution is finished before the previous one, the response for the later message is received first as depicted in the below diagram.
When the execution times out, the response is sent to dead letter mailbox and the caller actor never gets noticed.

<img src="https://raw.githubusercontent.com/oklahomer/protoactor-go-future-example/master/docs/pipe/timeline.png" style="max-width: 100%;">

```go
package main

import (
	"github.com/AsynkronIT/protoactor-go/actor"
	"github.com/AsynkronIT/protoactor-go/router"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type pong struct {
	count uint
}

type ping struct {
	count uint
}

type pingActor struct {
	count   uint
	pongPid *actor.PID
}

func (p *pingActor) Receive(ctx actor.Context) {
	switch msg := ctx.Message().(type) {
	case struct{}:
		p.count++
		// Output becomes somewhat like below.
		// See a diagram at https://raw.githubusercontent.com/oklahomer/protoactor-go-future-example/master/docs/pipe/timeline.png

		// 2018/10/14 14:20:36 Received pong message &main.pong{count:1}
		// 2018/10/14 14:20:39 Received pong message &main.pong{count:4}
		// 2018/10/14 14:20:39 Received pong message &main.pong{count:3}
		// 2018/10/14 05:20:39 [ACTOR] [DeadLetter] pid="nonhost/future$e" message=&{'\x02'} sender="nil"
		// 2018/10/14 14:20:42 Received pong message &main.pong{count:7}
		// 2018/10/14 14:20:42 Received pong message &main.pong{count:6}
		// 2018/10/14 05:20:42 [ACTOR] [DeadLetter] pid="nonhost/future$h" message=&{'\x05'} sender="nil"
		// 2018/10/14 14:20:45 Received pong message &main.pong{count:10}
		// 2018/10/14 14:20:45 Received pong message &main.pong{count:9}
		// 2018/10/14 05:20:45 [ACTOR] [DeadLetter] pid="nonhost/future$k" message=&{'\b'} sender="nil"
		message := &ping{
			count: p.count,
		}
		ctx.RequestFuture(p.pongPid, message, 2500*time.Millisecond).PipeTo(ctx.Self())

	case *pong:
		log.Printf("Received pong message %#v", msg)

	}
}

func main() {
	rootContext := actor.EmptyRootContext
	pongProps := router.NewRoundRobinPool(10).
		WithFunc(func(ctx actor.Context) {
			switch msg := ctx.Message().(type) {
			case *ping:
				var sleep time.Duration
				remainder := msg.count % 3
				if remainder == 0 {
					sleep = 1700 * time.Millisecond
				} else if remainder == 1 {
					sleep = 300 * time.Millisecond
				} else {
					sleep = 2900 * time.Millisecond
				}
				time.Sleep(sleep)

				message := &pong{
					count: msg.count,
				}
				ctx.Respond(message)
			}
		})
	pongPid := rootContext.Spawn(pongProps)

	pingProps := actor.PropsFromProducer(func() actor.Actor {
		return &pingActor{
			count:   0,
			pongPid: pongPid,
		}
	})
	pingPid := rootContext.Spawn(pingProps)

	finish := make(chan os.Signal, 1)
	signal.Notify(finish, syscall.SIGINT)
	signal.Notify(finish, syscall.SIGTERM)

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rootContext.Send(pingPid, struct{}{})

		case <-finish:
			log.Print("Finish")
			return

		}
	}
}
```

## Context.AwaitFuture

The message execution is done in the same way as Future.PipeTo, but a callback function is called even when the execution times out.

<img src="https://raw.githubusercontent.com/oklahomer/protoactor-go-future-example/master/docs/await_future/timeline.png" style="max-width: 100%;">

```go
package main

import (
	"github.com/AsynkronIT/protoactor-go/actor"
	"github.com/AsynkronIT/protoactor-go/router"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type tick struct {
	count int
}

type pong struct {
	count int
}

type ping struct {
	count int
}

type pingActor struct {
	pongPid *actor.PID
}

func (p *pingActor) Receive(ctx actor.Context) {
	switch msg := ctx.Message().(type) {
	case *tick:
		// Output becomes somewhat like below.
		// See a diagram at https://raw.githubusercontent.com/oklahomer/protoactor-go-future-example/master/docs/await_future/timeline.png
		//
		// 2018/10/14 16:10:49 Received pong response: &main.pong{count:1}
		// 2018/10/14 16:10:52 Received pong response: &main.pong{count:4}
		// 2018/10/14 16:10:52 Failed to handle: 2. message: &main.tick{count:2}.
		// 2018/10/14 16:10:53 Received pong response: &main.pong{count:3}
		// 2018/10/14 07:10:53 [ACTOR] [DeadLetter] pid="nonhost/future$e" message=&{'\x02'} sender="nil"
		// 2018/10/14 16:10:55 Received pong response: &main.pong{count:7}
		// 2018/10/14 16:10:55 Failed to handle: 5. message: &main.tick{count:5}.
		// 2018/10/14 16:10:56 Received pong response: &main.pong{count:6}
		// 2018/10/14 07:10:56 [ACTOR] [DeadLetter] pid="nonhost/future$h" message=&{'\x05'} sender="nil"
		// 2018/10/14 16:10:58 Received pong response: &main.pong{count:10}
		// 2018/10/14 16:10:58 Failed to handle: 8. message: &main.tick{count:8}.
		// 2018/10/14 16:10:59 Received pong response: &main.pong{count:9}
		// 2018/10/14 07:10:59 [ACTOR] [DeadLetter] pid="nonhost/future$k" message=&{'\b'} sender="nil"

		message := &ping{
			count: msg.count,
		}
		future := p.pongPid.RequestFuture(message, 2500*time.Millisecond)

		cnt := msg.count
		ctx.AwaitFuture(future, func(res interface{}, err error) {
			if err != nil {
				// Context.Message() returns the exact message that was present on Context.AwaitFuture call.
				// ref. https://github.com/AsynkronIT/protoactor-go/blob/3992780c0af683deb5ec3746f4ec5845139c6e42/actor/local_context.go#L289
				log.Printf("Failed to handle: %d. message: %#v.", cnt, ctx.Message())
				return
			}

			switch res.(type) {
			case *pong:
				log.Printf("Received pong response: %#v", res)

			default:
				log.Printf("Received unexpected response: %#v", res)

			}
		})
	}
}

func main() {
	pongProps := router.NewRoundRobinPool(10).
		WithFunc(func(ctx actor.Context) {
			switch msg := ctx.Message().(type) {
			case *ping:
				var sleep time.Duration
				remainder := msg.count % 3
				if remainder == 0 {
					sleep = 1700 * time.Millisecond
				} else if remainder == 1 {
					sleep = 300 * time.Millisecond
				} else {
					sleep = 2900 * time.Millisecond
				}
				time.Sleep(sleep)

				message := &pong{
					count: msg.count,
				}
				ctx.Sender().Tell(message)
			}
		})
	pongPid := actor.Spawn(pongProps)

	pingProps := actor.FromProducer(func() actor.Actor {
		return &pingActor{
			pongPid: pongPid,
		}
	})
	pingPid := actor.Spawn(pingProps)

	finish := make(chan os.Signal, 1)
	signal.Notify(finish, os.Interrupt)
	signal.Notify(finish, syscall.SIGTERM)

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	count := 0
	for {
		select {
		case <-ticker.C:
			count++
			pingPid.Tell(&tick{count: count})

		case <-finish:
			return
			log.Print("Finish")

		}
	}
}
```

## References
- [[Golang] Protoactor-go 101: Introduction to golang's actor model implementation](https://blog.oklahome.net/2018/07/protoactor-go-introduction.html)
- [[Golang] Protoactor-go 101: How actors communicate with each other](https://blog.oklahome.net/2018/09/protoactor-go-messaging-protocol.html)
- [[Golang] protoactor-go 101: How actor.Future works to synchronize concurrent task execution](https://blog.oklahome.net/2018/11/protoactor-go-how-future-works.html)
- [[Golang] protoactor-go 201: How middleware works to intercept incoming and outgoing messages](https://blog.oklahome.net/2018/11/protoactor-go-middleware.html)
- [[Golang] protoactor-go 201: Use plugins to add behaviors to an actor](https://blog.oklahome.net/2018/12/protoactor-go-use-plugin-to-add-behavior.html)

