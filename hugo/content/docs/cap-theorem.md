---
title: "CAP Theorem"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# CAP Theorem

The CAP theorem states that in the presence of a network partition a distributed system can provide either consistency or availability, but not both simultaneously. For an overview of consistency trade‑offs, see [Consistency Models](consistency-models.md).

## Consistency
Reads return the most recent write. Choosing consistency often requires coordination—for example via [Consensus and Leader Election](consensus.md)—and may lead to unavailability if partitions occur.

## Availability
Every request receives a response, even if it may not be the latest data. Systems that favor availability handle partitions by serving stale data and reconciling later.

## Partition Tolerance
Network failures happen. Proto.Actor embraces this by allowing actors to recover, replay events and rebuild state when partitions heal; see [Cluster Partitions](cluster-partitions.md) for strategies that keep actors reachable.

## Working with CAP in Proto.Actor
Proto.Actor does not dictate where you land on the CAP spectrum. Instead it provides primitives—like persistence, clustering and message passing—so you can build systems that choose consistency or availability depending on business requirements. Strong consistency can be layered on with [Consensus and Leader Election](consensus.md), while eventually consistent designs can rely on [Fault Tolerance](fault-tolerance.md) and [Durability](durability.md).
