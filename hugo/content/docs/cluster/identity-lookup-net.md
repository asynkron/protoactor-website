---
layout: docs.hbs
title: Identity Lookup (.NET)
---

# Identity Lookup (.NET)

this is how actors are located

### `IIdentityLookup` - Interface

This allows the identity lookup strategy to be replaced.
The built-in, default is the PartitionIdentityLookup.

- ##### `PartitionIdentityLookup` - Implementation

  For more information about the details of cluster mechanics.
  See [Cluster Partitions](cluster-partitions.md)

  - `PartitionIdentitySelector` - The hashing algorithm that decides the relation between Identity and Member

  - `PartitionPlacementActor` - This actor manages the actual actor instances. it also knows which member owns the identity and can transfer actor identity ownership when topology changes

  - `PartitionIdentityActor` - Manages the owned identities for a member.

...