---
title: "Sharding and Data Partitioning"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# Sharding and Data Partitioning

Sharding splits data or workload across nodes so that no single machine becomes a bottleneck. In Proto.Actor this typically means distributing virtual actors across the cluster.

## Why Shard?
- Scale horizontally by distributing actors or state.
- Reduce contention by isolating unrelated data.
- Place data close to users for lower latency.

## Strategies
- **Consistent hashing** keeps related keys on the same node and minimizes movement when members join or leave.
- **Range or attribute based partitioning** uses business keys like customer id or region.

## Proto.Actor Tools
Virtual actors are Proto.Actor's primary sharding mechanism. Each actor identity maps to a partition, and placement strategies together with identity lookup providers decide on which node an activation should live. Combined with persistence, sharding enables rebuilding actors only on the node responsible for their partition.

## Considerations
Account for rebalancing when nodes join or crash and ensure actors handle duplicate activations during migrations.
