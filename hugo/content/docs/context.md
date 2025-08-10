---
title: "Context"
date: 2021-02-17T12:00:00+00:00
draft: false
tags: [protoactor, docs]
---

# Context

Proto.Actor provides two forms of Context, a `RootContext` and an `ActorContext`. These contexts are composed of various functionality provided by distinct facets. Both types of context implement `Spawner`, `Stopper`, `Info` and `Sender` facets, while the `ActorContext` implements additional facets.

## Root Context Facets

  - [Spawner](#spawner)
  - [Stopper](#stopper)
  - [Info](#info)
  - [Sender](#sender)

## Actor Context Facets

  - [Spawner](#spawner)
  - [Stopper](#stopper)
  - [Info](#info)
  - [Sender](#sender)
  - [Receiver](#receiver)
  - [Invoker](#invoker)
  - [Supervisor](#supervisor)

## Context Facets

### Spawner

*Implemented by* `RootContext`, `ActorContext`

Provides the ability to spawn new actors given a `Props` parameter.

#### .NET

```csharp
    var system = new ActorSystem();
    var props = Props.FromProducer(() => new GreetingActor());
    var pid = system.Root.Spawn(props);

      // other actor spawning methods:
      // system.Root.SpawnNamed(props, name: "greeter");
      // system.Root.SpawnPrefix(props, prefix: "greet-");
  ```

#### Go

```go
system := actor.NewActorSystem()
props := actor.PropsFromProducer(func() actor.Actor { return &GreetingActor{} })
pid := system.Root.Spawn(props)

// other actor spawning methods:
// system.Root.SpawnNamed(props, "greeter")
// system.Root.SpawnPrefix(props, "greet-")
```


### Stopper

*Implemented by* `RootContext`, `ActorContext`

Provides the ability to immediately stop an actor, or instruct it to stop after processing current mailbox messages.

#### .NET

```csharp
    // stop immediately
    context.Stop(pid);
    await context.StopAsync(pid);

    // stop after processing current user messages in mailbox
    context.Poison(pid);
    // await context.PoisonAsync(pid);
  ```

#### Go

```go
// stop immediately
context.Stop(pid)
// context.StopFuture(pid)

// stop after processing current user messages in mailbox
context.Poison(pid)
// context.PoisonFuture(pid)
```


### Info

*Implemented by* `RootContext`, `ActorContext`

Provides access to information about the context such as the current actor's `Parent` PID, its `Self` PID, the `Sender` PID of the current message, the `Actor` itself, and the `ActorSystem` in which the actor resides.

### Sender

*Implemented by* `RootContext`, `ActorContext`

Provides the ability to `Send` fire-and-forget style messages and `Request` responses from an actor asynchronously.

#### .NET

```csharp
    var message = new MyMessage();
    var request = new MyRequest();

    context.Send(pid, message);
    
      var response = context.Request<MyResponse>(pid, request);

  ```

#### Go

```go
message := &MyMessage{}
request := &MyRequest{}

context.Send(pid, message)

response, _ := context.RequestFuture(pid, request, 3*time.Second).Result()
```


### Receiver

*Implemented by* `ActorContext`

Provides the ability to `Receive` messages wrapped in a `MessageEnvelope`

#### .NET

```csharp
    await context.Receive(envelope);
```

#### Go

```go
context.Receive(envelope)
```


### Invoker

*Implemented by* `ActorContext`

Invocation provides abilities to invoke system messages, invoke user messages, and escalate failures.

### Supervisor

*Implemented by* `ActorContext`

Supervision provides methods for controlling the lifecycle of child actors under supervision of the current actor and the ability to escalate failures up to the next actor in a supervision hierarchy.
