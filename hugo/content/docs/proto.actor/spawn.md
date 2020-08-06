---
layout: docs.hbs
title: Spawning Actors
---

# Spawning Actors

Spawning an actor consists of two steps:
1. Create Props that define how the actor should be created. See [Props](props.md).
2. Spawn the actor using the Props

There are three primary ways to spawn actors:
```csharp
var system = new ActorSystem();
var pid1 = system.Root.Spawn(props); // spawn an actor with an auto-generated name
var pid2 = system.Root.SpawnPrefix(props, "prefix"); // spawn an actor with a prefix followed by an auto-generated name
var pid3 = system.Root.SpawnNamed(props, "my-actor"); // spawn an actor with an exact name
```
{{< note >}}
If an actor already exists with the specified name, this will throw a `ProcessNameExistException`.
{{</ note >}}

It is also possible for an actor to spawn a child actor that it will supervise (see [Supervision](supervision.md) for more details). To do this, instead use the spawn methods on the `IContext` from within the actor's `Receive` method:

```csharp
public Task ReceiveAsync(IContext context)
{
    var pid1 = context.Spawn(props);
    var pid2 = context.SpawnPrefix(props, "prefix");
    var pid3 = context.SpawnNamed(props, "my-actor");
}
```
