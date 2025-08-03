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

{{< tabs >}}
{{< tab "C#" >}}
```csharp
    var system = new ActorSystem();
    var props = Props.FromProducer(() => new GreetingActor());
    var pid = system.Root.Spawn(props);

    // other actor spawning methods:
    // system.Root.SpawnNamed(props, name: "greeter");
    // system.Root.SpawnPrefix(props, prefix: "greet-");
```
{{</ tab >}}
{{</ tabs >}}

### Stopper

*Implemented by* `RootContext`, `ActorContext`

Provides the ability to immediately stop an actor, or instruct it to stop after processing current mailbox messages.

{{< tabs >}}
{{< tab "C#" >}}
```csharp
    // stop immediately
    context.Stop(pid);
    await context.StopAsync(pid);

    // stop after processing current user messages in mailbox
    context.Poison(pid);
    await context.PoisonAsync(pid);
```
{{</ tab >}}
{{</ tabs >}}

### Info

*Implemented by* `RootContext`, `ActorContext`

Provides access to information about the context such as the current actor's `Parent` PID, its `Self` PID, the `Sender` PID of the current message, the `Actor` itself, and the `ActorSystem` in which the actor resides.

### Sender

*Implemented by* `RootContext`, `ActorContext`

Provides the ability to `Send` fire-and-forget style messages and `Request` responses from an actor asynchronously.

{{< tabs >}}
{{< tab "C#" >}}
```csharp
    var message = new MyMessage();
    var request = new MyRequest();

    context.Send(pid, message);
    
    var response = context.Request<MyResponse>(pid, request);

```
{{</ tab >}}
{{</ tabs >}}

### Receiver

*Implemented by* `ActorContext`

Provides the ability to `Receive` messages wrapped in a `MessageEnvelope`

{{< tabs >}}
{{< tab "C#" >}}
```csharp
    await context.Receive(envelope);
```
{{</ tab >}}
{{</ tabs >}}

### Invoker

*Implemented by* `ActorContext`

Invocation provides abilities to invoke system messages, invoke user messages, and escalate failures.

### Supervisor

*Implemented by* `ActorContext`

Supervision provides methods for controlling the lifecycle of child actors under supervision of the current actor and the ability to escalate failures up to the next actor in a supervision hierarchy.
