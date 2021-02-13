# How actors communicate with each other

{{< note >}}
This repository contains supplemental examples for my blog article, [[Golang] Protoactor-go 101: How actors communicate with each other](https://blog.oklahome.net/2018/09/protoactor-go-messaging-protocol.html) , to cover all message passing methods for all kinds of actors provided by protoactor-go.
{{</ note >}}

<img src="https://raw.githubusercontent.com/oklahomer/protoactor-go-sender-example/master/docs/components.png"
style="max-width: 100%;">

## Local
For local message passing, see below directory:

#### Local Send 
Use `Send()` for local message passing. The recipient actor cannot refer to the sender actor.
[Source Code](https://github.com/oklahomer/protoactor-go-sender-example/tree/master/local-send)

#### Local Request 
Use `Request()` for local message passing. The recipient actor can refer to the sender actor. [Source Code](https://github.com/oklahomer/protoactor-go-sender-example/tree/master/local-request)

#### Local Future
Use `RequestFuture()` for local message passing. `Context.Sender()` does not return the PID of sender actor but that of actor.Future. 
[Source Code](https://github.com/oklahomer/protoactor-go-sender-example/tree/master/local-future)

## Remote
- remote/messages ... Contain Protobuf serializable message structures.
- rmeote/remote-pong ... A process that returns pong message to sender.
- remote/remote-ping-send ... A process that sends message to pong actor by Send(). The recipient cannot refer to the sender actor.
- remote/remote-ping-request ... A process that sends message to pong actor by Request(). The recipient actor can refer to the sender actor.
- remote/remote-poing-future ... A process that sends message to pong actor by RequestFuture(). Context.Sender() does not return the PID of sender actor but that of actor.Future.

## Cluster Grain
- cluster/messages ... Contain Protobuf serializable message structures and generated actor.Actor implementation for gRPC based communication.

### Cluster Grain usage with remote communication
- cluster/cluster-pong-remote ... A process that returns pong message to the sender based on remote actor implementation.
- cluster/cluster-ping-send ... A process that sends message to pong actor by Send(). The recipient cannot refer to the sender actor.
- cluster/cluster-ping-request ... A process that sends message to pong actor by Request(). The recipient actor can refer to the sender actor.
- cluster/cluster-ping-future ... A process that sends message to pong actor by RequestFuture(). Context.Sender() does not return the PID of sender actor but that of actor.Future.

### Cluster Grain usage with gRPC based communication
- cluster/cluster-pong-grpc ... A process that returns pong message to the sender via gRPC service.
- cluster/cluster-ping-grpc ... A process that sends message to pong actor over gRPC based service.

## References
- [[Golang] Protoactor-go 101: Introduction to golang's actor model implementation](https://blog.oklahome.net/2018/07/protoactor-go-introduction.html)
- [[Golang] Protoactor-go 101: How actors communicate with each other](https://blog.oklahome.net/2018/09/protoactor-go-messaging-protocol.html)
- [[Golang] protoactor-go 101: How actor.Future works to synchronize concurrent task execution](https://blog.oklahome.net/2018/11/protoactor-go-how-future-works.html)
- [[Golang] protoactor-go 201: How middleware works to intercept incoming and outgoing messages](https://blog.oklahome.net/2018/11/protoactor-go-middleware.html)
- [[Golang] protoactor-go 201: Use plugins to add behaviors to an actor](https://blog.oklahome.net/2018/12/protoactor-go-use-plugin-to-add-behavior.html)
