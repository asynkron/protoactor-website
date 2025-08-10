---
title: "Proto.Actor Documentation"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Proto.Actor Framework

## TL;DR: Just show me the code!

- [Hello World](hello-world)
- [Getting Started](getting-started)
- [Getting Started With Grains / Virtual Actors (.NET)](cluster/getting-started-net.md)
- [Getting Started With Grains / Virtual Actors (Go)](cluster/getting-started-go.md)
- [Deploy to Kubernetes](cluster/getting-started-kubernetes.md)

## Introduction

- [What is Proto.Actor?](what-is-protoactor)
- [Why Proto.Actor](why-protoactor)
- [Design Principles](design-principles)
- [Features](features)

## Concepts

- [What is an Actor?](actors.md)
- [What is a Message?](messages.md)
- [Actor Communication](communication.md)
- [Terminology, Concepts](terminology.md)
- [Supervision and Monitoring](supervision.md)
- [Fault Tolerance](fault-tolerance.md)
- [Actor lifecycle](life-cycle.md)
- [Location Transparency](location-transparency.md)
- [Message Delivery Reliability](durability.md)
- [Message Patterns](message-patterns.md)
- [Actors vs Queues and Logs](actors-vs-queues.md) - When to pick real-time actors vs durable messaging
- [Backpressure and Flow Control](backpressure.md)
- [Consistency Models](consistency-models.md)
- [CAP Theorem](cap-theorem.md)
- [Consensus and Leader Election](consensus.md)
- [Service Discovery](service-discovery.md)
- [Sharding and Data Partitioning](sharding-and-partitioning.md)

## Building Blocks

### Core Features

- [Actor](actors.md) - What are actors?
  - [Props](props.md) - How do I configure actors?
  - [Spawning Actors](spawn.md) - How do I instantiate actors?
  - [PID](pid.md) - How do I communicate with actors?
  - [Context](context.md) - What are actor and root contexts?
    - [ReenterAfter](reenter.md) - How do I handle reentrancy in actors?
  - [Mailboxes](mailboxes.md) - How does the actor process messages?
  - [Deadletter](deadletter.md) - What happens to lost messages?
  - [Router](routers.md) - How do I forward messages to pools or groups of workers?
  - [Eventstream](eventstream.md) - How are infrastructure events managed?
  - [Behaviors](behaviors.md) - How do I build state machines with actors?
  - [Middleware](middleware.md) - How do I intercept or observe messages between actors?
  - [Receive Timeout](receive-timeout.md) - How do I trigger code when actors go idle?
  - [Futures (Go)](futures.md) - How do I react to task completions?
  - [Dispatchers](dispatchers.md) - How do I tweak how and where actors execute?
  - [Dependency Injection (.NET)](di.md) - How do I configure actors using Dependency Injection?
  - [Dealing with deadlocks](deadlocks.md)
- [Persistence of actor's state](persistence.md) - How do I persist state for actors?
  - [Using 3rd party libraries](externalpersistence.md) - How do I persist state using external libraries?
- [Remote](remote.md) - How do I communicate with actors on other nodes?
  - [Message Serialization](serialization.md)
  - [Remote Spawning](remote-spawn.md) - How do I spawn actors on other nodes?
  - [gRPC Compression](grpc-compression.md) - How do I use gRPC compression for remote communication?
- [Cluster of virtual actors / grains](cluster.md) - How do I build clusters of grains / virtual actors?
  - [Working with a cluster (.NET)](cluster/using-cluster-net.md)
  - [Generating grains (.NET)](cluster/codegen-net.md)
  - [Cluster providers (.NET)](cluster/cluster-providers-net.md) - What different clustering options do I have?
    - [Kubernetes Provider](cluster/kubernetes-provider-net.md)
    - [Consul Provider](cluster/consul-net.md)
    - [AWS ECS Provider](cluster/aws-provider-net.md)
    - [Seed Provider - Experimental](cluster/seed-provider-net.md)
  - [Identity lookup (.NET)](cluster/identity-lookup-net.md) - How to locate a virtual actor?
  - [Member strategies (.NET)](cluster/member-strategies.md) - Which member will host the virtual actor?
  - [Gossip](cluster/gossip.md) - How can I share state across cluster members?
  - [Blocklist](cluster/blocklist.md) - How do I handle blocked status of a member?
  - [Cluster Pub-Sub - Experimental](cluster/pub-sub.md) - How to broadcast messages in the cluster?
  - [Virtual Actors](cluster/virtual-actors-go.md) - How do I create virtual actors and spawn them in the cluster?
  - [Integration Testing](integration-tests.md) -  How do I integration-test virtual actors?
- [SimpleScheduler](scheduling.md) - How do I send messages on a timer?
- [Built in messages](messages)


### Utility features

- [AsyncSemaphore](asyncsemaphore.md) - How do I limit concurrency to a given resource?
- [Batching Mailbox](mailboxes.md#batching-mailbox) - How do I collect many events and process as single one unit?
- [Throttle](throttle.md) - How do I throttle method calls?

## Performance

- [Benchmarks](performance/benchmarks.md)
- [Dotnetos performance review](performance/dotnetos.md)

## Observability

- [Tracing](tracing.md)
- [Metrics](metrics.md)
- [Logging](logging.md)
- [Health Checks](health-checks.md)

## Extension models

- [Extensions and Context Decorator](context-decorator.md)

## Articles

{{< article-clean >}}

## Useful Patterns

- [Ask Pattern](ask-pattern.md)
- [Idempotency in Messaging](idempotency.md)
- [Message Throttling](throttling.md)
- [Work Pulling Pattern](work-pulling.md)
- [Limit Concurrency](limit-concurrency.md)
- [Scheduling Periodic Messages](scheduling.md)
- [Envelope Pattern](envelope-pattern.md)
- [Local Affinity](local-affinity.md)
- [Placement Strategies](placement-strategies.md)
- [Coordinated Persistence](coordinated-persistence.md)
- [Batched Persistence](persistence.md#batched-persistence)
- [Circuit Breaker Pattern](circuit-breaker.md)

## Additional Information

- [Core vs contrib Proto.Actor components](core-contrib-components.md)
- [Proto.Actor vs Erlang and Akka](protoactor-vs-erlang-akka.md)
- [Books](books.md)
