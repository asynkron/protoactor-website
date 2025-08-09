---
title: "Consensus and Leader Election"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# Consensus and Leader Election

Consensus algorithms coordinate state across nodes so that the cluster agrees on a single value. They are essential when strong consistency or coordination is required, as described by the [CAP Theorem](cap-theorem.md) and the trade‑offs in [Consistency Models](consistency-models.md).

## Why Consensus?
Failures and partitions can create multiple conflicting updates. Protocols like Raft or Paxos elect a leader and replicate a log to keep nodes in sync.

## Proto.Actor and Consensus
Proto.Actor includes a gossip protocol for state dissemination and a lightweight consensus API. Using `ConsensusCheck<T>` you can ask the cluster to agree on a value or ensure that a majority of members have reached a given state. These features handle common coordination tasks without external dependencies, though you can still integrate with Kubernetes, Consul or etcd for more advanced scenarios or durable storage of critical state.

## Leader Election Strategies
Use external coordinators (e.g. etcd, ZooKeeper) to choose a leader, or implement a simple election using cluster gossip and timeouts when eventual consistency is acceptable.

## When to Use
Apply consensus when you must serialize updates, manage shared resources or coordinate configuration. Otherwise prefer eventually consistent approaches for better availability and throughput.
