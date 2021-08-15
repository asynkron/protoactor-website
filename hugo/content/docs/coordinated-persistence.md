# Coordinated Persistence

Coordinated persistence is a pattern which allow you to limit the number of writes to a database by collecting data that should be written, and writing it in a single operation.

Using persistent actors, where each actor either use the built in Proto.Persistence or custom data access logic, there could be a large number of writes to the data store if each actor independently and concurrently tries to store its' own data.
There are many ways to deal with this issue, e.g. using an [AsyncSemaphore](async-semaphore.md), or a [BatchWriter](batch-writer.md) strategy.

Coordinated Persistence is yet another strategy for the same scenario.

The idea is as follows,
Instead of each actor being responsible for persisting its own state, by calling the data access layer directly, you instead leave the responsibility for persistence to the caller.
Meaning, if you have some form of message forwarder, e.g. reading from Kafka, rabbit MQ or some IoT ingress, you can let the forwarder forward messages to the target actors, and instead of awaiting for an "Ack" from each.
you instead pass back the data that should be persisted, be it domain events or full snapshots of state.

The benefit here is that you can now collect all those state changes together, and write them using a batch operation to the data store.
e.g. using MongoDB or Redis.

The main benefit here is that you can have exactly one write, coordinated with underlaying messaging infrastructure.
e.g. writing a single batch of changes before committing offsets to say Kafka.
