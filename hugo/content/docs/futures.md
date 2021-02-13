This repository shows usages of `actor.Future`.

## Future.Wait/Future.Result
`Future.Wait()` or `Future.Result()` wait until the response comes or the execution times out.
Since the actor blocks, incoming messages stuck in the mailbox.

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

## References
- [[Golang] Protoactor-go 101: Introduction to golang's actor model implementation](https://blog.oklahome.net/2018/07/protoactor-go-introduction.html)
- [[Golang] Protoactor-go 101: How actors communicate with each other](https://blog.oklahome.net/2018/09/protoactor-go-messaging-protocol.html)
- [[Golang] protoactor-go 101: How actor.Future works to synchronize concurrent task execution](https://blog.oklahome.net/2018/11/protoactor-go-how-future-works.html)
- [[Golang] protoactor-go 201: How middleware works to intercept incoming and outgoing messages](https://blog.oklahome.net/2018/11/protoactor-go-middleware.html)
- [[Golang] protoactor-go 201: Use plugins to add behaviors to an actor](https://blog.oklahome.net/2018/12/protoactor-go-use-plugin-to-add-behavior.html)

