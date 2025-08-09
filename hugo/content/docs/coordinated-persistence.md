---
title: Coordinated Persistence
---

# Coordinated Persistence

Coordinated persistence is a pattern that limits database writes by collecting data and writing it in a single operation.

With persistent actors—each using either the built-in Proto.Persistence or custom data access logic—there could be a large number of writes to the data store if each actor independently and concurrently tries to store its own data.
There are many ways to deal with this issue, e.g. using an [AsyncSemaphore](asyncsemaphore.md), or a [BatchWriter](batched-persistence.md) strategy.

Coordinated Persistence is yet another strategy for the same scenario.

The idea is as follows:
Instead of each actor being responsible for persisting its own state by calling the data access layer directly, you leave the responsibility for persistence to the caller.
Meaning, if you have some form of message forwarder, e.g. reading from Kafka, Rabbit MQ or some IoT ingress, you can let the forwarder send messages to the target actors and, instead of awaiting an "Ack" from each,
you instead pass back the data that should be persisted, be it domain events or full snapshots of state.

The benefit here is that you can now collect all those state changes together, and write them using a batch operation to the data store.
e.g. using MongoDB or Redis.

The main benefit here is that you can have exactly one write, coordinated with underlying messaging infrastructure.
e.g. writing a single batch of changes before committing offsets to say Kafka.

Requires:

- A central point of message Fan-out

Pros:

- A single write to data store for a batch of messages

Cons:

- Blurred responsibility of where data access is performed
