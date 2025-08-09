---
title: "Backpressure and Flow Control"
date: 2025-08-09
draft: false
tags: [actors, backpressure]
---

# Backpressure and Flow Control

A common misconception is that actor systems automatically handle unlimited message rates. In reality, every actor has finite processing capacity. Unbounded mailboxes may lead to increased memory usage and eventually to process failure.

## Strategies inside Proto.Actor

- **Bounded mailboxes** limit how many messages an actor can queue.
- **Throttling** or **work pulling** lets actors request work only when ready.
- **Batching** aggregates many messages into one processing unit.

## When external queues help

If producers outrun consumers for extended periods, or if you need durable buffering, place a persistent queue or log in front of the actor system. The queue provides storage and delivery guarantees while actors handle the business logic once they are ready to consume messages.

Backpressure is about matching the rate of production to the rate of consumption. Use actors for behaviour and concurrency, but rely on queues or logs when you need durable, elastic buffering.

