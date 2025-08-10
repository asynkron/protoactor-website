---
title: "Actors vs Queues and Logs"
date: 2025-08-09
draft: false
tags: [actors, queues, logs]
---

# Actors vs Queues and Logs

Choosing the right building block for asynchronous workloads is critical. Actors excel at managing in-memory state and orchestrating concurrent work. Their mailboxes are ephemeral and rely on best-effort delivery. If a process crashes, in-flight messages may be lost. For workflows that demand durable delivery, ordering or replay, a dedicated queue or log is the safer option.

The diagram below contrasts direct actor messaging with using a persistent queue or log.

```mermaid
graph LR
    producer((Producer<br>Actor))
    consumer((Consumer<br>Actor))
    queue[(Queue/Log)]
    class queue yellow

    producer --> consumer
    producer --- queue --> consumer
```

## Real-time vs durable messaging

Actors pass messages directly in memory and can react in microseconds. This makes them ideal for real-time workloads such as multiplayer games or IoT device coordination where even small delays are unacceptable. Queues and logs persist to disk and replicate data, adding milliseconds of latency. They are "realtime-ish": great for reliability, but they cannot meet ultra low-latency requirements.

## When to choose actors

- Coordinating in-memory state and behaviour
- Performing lightweight or transient tasks
- Reacting to messages where occasional loss is acceptable

## When to choose a queue or log

- You need at-least-once or exactly-once guarantees
- Messages must survive process restarts or crashes
- Work needs to be distributed over time or across many consumers

Queues (e.g. RabbitMQ) and logs (e.g. Kafka) store messages durably and let consumers reprocess them if needed. Proto.Actor can integrate with these systems, but the queue or log remains the source of truth. Actors should focus on domain behaviour, while the messaging infrastructure provides reliability.

Combine these when necessary: for example, consume from Kafka (a log) and update per-user actors for coordination.

## Comparison

| Aspect | Queue | Log | Actor |
|-------|------|-----|------|
|Typical Use|Task distribution|Event history & replay|Stateful concurrency|
|Ordering|Per-queue|Per-partition|Mailboxes order locally|
|Retention|Short-lived|Configurable, long-lived|In-memory state|
|Throughput|Low to medium|High|Depends on processing|
|Latency|Low|Higher due to batching|Low for local actors|
|Scaling|Consumers compete; single queue becomes bottleneck|Partition across brokers|Spawn more actors or shards|
|Backpressure|Consumers ack/nack|Consumers track offsets|Mailbox bounds & throttling|

## Decision helper

```mermaid
graph TB
    start(Incoming Workload)
    q[Queue]
    l[Log]
    a((Actor))
    start --> q
    start --> l
    start --> a
```

## Further reading

- [Backpressure](backpressure.md) describes how queues and actors interact under load.
- [Idempotency](idempotency.md) outlines how to handle duplicates in all transports.

In short: not everything should be actor based. If your scenario requires strong delivery guarantees and can tolerate extra latency, persist the messages in a queue or log first and let actors pull work from there. Conversely, when ultra low latency is essential, keep the work in memory and lean on actors.

