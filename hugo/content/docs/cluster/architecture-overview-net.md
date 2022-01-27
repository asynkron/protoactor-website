---
layout: docs.hbs
title: Cluster architecture overview (.NET)
---

# Cluster architecture overview

![Cluster Architecture](images/cluster-architecture.png)

### `IClusterProvider` - Interface

This allows the membership logic to be replaced.

todo: the list is already on a different page

- ##### Consul Provider
- ##### Kubernetes Provider
- ##### AWS ECS Provider
- ##### Etcd Provider
- ##### Self Managed Provider
- ##### Zookeeper Provider

### `IIdentityLookup` - Interface

This allows the identity lookup strategy to be replaced.
The built-in, default is the PartitionIdentityLookup.

todo: the list is already on a different page

- ##### `PartitionIdentityLookup` - Implementation

  For more information about the details of cluster mechanics.
  See [Cluster Partitions](cluster-partitions.md)

  - `PartitionIdentitySelector` - The hashing algorithm that decides the relation between Identity and Member

  - `PartitionPlacementActor` - This actor manages the actual actor instances. it also knows which member owns the identity and can transfer actor identity ownership when topology changes

  - `PartitionIdentityActor` - Manages the owned identities for a member.

### `TopologyUpdate` - EventStream message

Consumed by all aspects of the cluster infrastructure to update caches, lookups, shutting down connections etc.

## Tutorials

### Cluster Introduction

[Cluster Introduction](/docs/cluster/intro/clusterintro)

...