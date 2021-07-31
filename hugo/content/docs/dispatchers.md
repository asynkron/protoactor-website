---
title: Dispatchers
---

# Dispatchers

## What Do Dispatchers Do?

Dispatchers are responsible for scheduling all code that run inside the `ActorSystem`.
Dispatchers are one of the most important parts of Proto.Actor, as they control the throughput and
time share for each of the actors, giving each one a fair share of resources.

By default, all actors share a single **Global Dispatcher**.
Unless you change the configuration, this dispatcher uses the _.NET Thread Pool_ behind the scenes,
which is optimized for most common scenarios.
**That means the default configuration should be _good enough_ for most cases.**

#### Why should I use different dispatchers?

When messages arrive in the [actor's mailbox](mailboxes.md), the dispatcher schedules the delivery of
messages in batches, and tries to deliver the entire batch before releasing the thread to another actor.

There are some other common reasons to select a different dispatcher. These reasons include (but are not limited to):

- isolating one or more actors to specific threads in order to:
  - ensure high-load actors don't starve the system by consuming too much cpu-time;
  - ensure important actors always have a dedicated thread to do their job;
  - create [bulkheads](http://skife.org/architecture/fault-tolerance/2009/12/31/bulkheads.html), ensuring problems created in one part of the system do not leak to others;
- allow actors to execute in a specific `SyncrhonizationContext`; (.NET specific)

{{< note >}}
Consider using custom dispatchers for special cases only. Correctly configuring dispatchers requires some understanding of
how the framework works. Custom dispatchers _should not_ be considered the default solution for performance problems.
It's considered normal for complex applications to have one or a few custom dispatchers, it's not usual for most or all actors in a system to require a custom dispatcher configuration.
{{</ note >}}

## Configuring Dispatchers

Dispatchers are configured via `Props` like so:

```csharp
var props = Props.FromProducer(() => new MyActor()).WithDispatcher(dispatcher);
```

#### Built-in Dispatchers

Some dispatchers are available out-of-the-box for convenience.

- `ThreadPoolDispatcher` - a dispatcher that schedules the mailbox as a `Task` on the threadpool.
- `CurrentSynchronizationContext` - a dispatcher that runs on the current synchronization context. e.g in WPF.
- `SynchronousDispatcher` - a dispatcher that runs synchronously (blocking).
