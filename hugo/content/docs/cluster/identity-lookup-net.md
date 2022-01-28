---
layout: docs.hbs
title: Identity Lookup (.NET)
---

# Identity Lookup (.NET)

Identity lookup allows the Proto.Cluster to use different strategies to locate virtual actors. Depending on the use case, different strategy will be suitable.

## Partition Identity Lookup

The main feature of this strategy is to split responisibility of owning actor's identity from responsibility of placing it in some member. So in general, one cluster member is responsible to keep actor's identity and another to spawn in the cluster.

![Parition Identity Lookup](images/partition-identity-lookup.jpg)

Partition Identity Lookup can work in 4 modes:

* Pull, Send: Full - identity owner pulls the full topology structure from placement actor
* Pull, Send: Delta (Experimental) - identity owner pulls only information about actors that were affected by topology change from placement actor
* Push, Send: Full (Experimental) - placement actor pushes full topology structure to identity owners
* Push, Send: Delta (Experimental) - placement actor pushes only information about actors that were affected by topology change to identity owners

### Mode Pull, Send Full rebalance

![Pull-full rebalance](images/rebalance-pull-handovers.png)




* PatitionActivatorLookup



* DBIdentityLookup
  
  * Redis implementaion

  * Mongo implementation

