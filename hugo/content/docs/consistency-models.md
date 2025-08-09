---
title: "Consistency Models"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# Consistency Models

Distributed systems must balance consistency with availability and latency. These choices are often framed by the [CAP Theorem](cap-theorem.md). Proto.Actor leaves those trade‑offs to application design so you can choose a model that fits your needs.

## Strong Consistency

A strongly consistent system ensures that every read sees the latest write. Achieving this typically requires coordination or [consensus](consensus.md) which adds latency and reduces availability. Use strong consistency when correctness outweighs availability, e.g. critical financial transactions.

## Eventual Consistency

Eventual consistency allows replicas to diverge temporarily but guarantees they converge when messages are delivered. Proto.Actor's at‑most‑once messaging and location transparency work well with eventually consistent designs such as CRDTs or event sourcing because actors can replay or reconcile state after reconnection. Techniques like [Fault Tolerance](fault-tolerance.md) and [Durability](durability.md) help manage the trade‑offs.

## Causal Consistency

Causal consistency preserves the "happens‑before" relationship between messages. Proto.Actor maintains per‑sender ordering which helps achieve causal consistency within an actor system when the application tracks message dependencies.

## Choosing a Model

Consider the business impact of stale data, the cost of coordination and the expected failure modes. Proto.Actor exposes building blocks—actors, persistence and messaging—so you can implement the consistency guarantees required by your domain.
