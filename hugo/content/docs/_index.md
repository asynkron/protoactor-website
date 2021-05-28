---
title: "Proto.Actor Documentation"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Proto.Actor Framework

## TLDR; Just show me the code!

* [Hello World](hello-world)
* [Getting Started](getting-started)

## Articles

{{< article-clean >}}

## Introduction

* [What is Proto.Actor?](what-is-protoactor)
* [Why Proto.Actor](why-protoactor)
* [Design Principles](design-principles)
* [Features](features)

## Concepts

* [What is an Actor?](actors.md)
* [What is a Message?](messages.md)
* [Terminology, Concepts](terminology.md)
* [Supervision and Monitoring](supervision.md)
* [Actor lifecycle](life-cycle.md)
* [Location Transparency](location-transparency.md)
* [Message Delivery Reliability](durability.md)

## Building Blocks

### Core Features

* [Actor](actors.md) - What are actors?
    * [Props](props.md) - How do I configure actors?
    * [Spawning Actors](spawn.md) - How do I instantiate actors?
    * [PID](pid.md) - How do I communicate with actors?
    * [Context](context.md) - What are actor and root contexts?
    * [Mailboxes](mailboxes.md) - How does the actor process messages?
    * [Deadletter](deadletter.md) - What happens to lost messages?
    * [Router](routers.md) - How do I forward messages to to pools or groups of workers?
    * [Eventstream](eventstream.md) - How are infrastructure events managed?
    * [Behaviors](behaviors.md) - How do I build state machines with actors?
    * [Middleware](middleware.md) - How do I intercept or observe messages between actors?
    * [Receive Timeout](receive-timeout.md) - How do I trigger code when actors go idle?
    * [Futures (Go)](futures.md) - How do I react to task completions?
* [Persistence](persistence.md) - How do I persist state for actors?
* [Remote](remote.md) - How do I communicate with actors on other nodes?
    * [Message Serialization](serialization.md)
    * [Remote Spawning](remote-spawn.md) - How do I spawn actors on other nodes?
    * [gRPC Compression](grpc-compression.md) - How do I use gRPC compression for remote communication?
* [Cluster](cluster.md) - How do I build clusters of actor nodes?    
* [SimpleScheduler](scheduling.md) - How do I send messages on a timer?

### Utility features

* [AsyncSemaphore](asyncsemaphore.md) - How do I limit concurrency to a given resource?
* [BatchingMailbox](batching-mailbox.md) - How do I collect many events and process as single one unit?
* [Throttle](throttle.md) - How do I throttle method calls?

## Observability

* [Tracing](tracing.md)
* [Metrics](metrics.md)
   * [Using custom metrics](custom-metrics.md)
* [Logging](logging.md)

## Extension models

* [ActorSystem Extensions](actorsystem-extensions.md)
* [Actor Extensions](actor-extensions.md)
* [Context Decorator](context-decorator.md)

## Useful Patterns

* [Message Throttling](throttling.md)
* [Work Pulling Pattern](work-pulling.md)
* [Limit Concurrency](limit-concurrency.md)
* [Scheduling Periodic Messages](scheduling.md)
* [Envelope Pattern](envelope-pattern.md)
* [Local Affinity](local-affinity.md)

## Additional Information

* [Books](books.md)

