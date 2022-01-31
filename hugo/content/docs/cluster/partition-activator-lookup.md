---
layout: docs.hbs
title: Partition Activator Lookup (.NET)
---

# PatitionActivatorLookup

This strategy is a simplification of ParitionIdentityLookup strategy. The same member is responsible for owning identity and placing actor.

During cluster rebalance PartitionActivatorActor only removes actors that are not belonging to this member anymore.

In this strategy it is not possible to use actor placement strategies. Actor is placed always in the member that is selected by hash algorithm.

![PartitionActivatorLookup](images/partitionActivatorLookup.jpg)
