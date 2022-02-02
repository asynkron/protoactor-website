---
title: "Proto.Cluster"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Proto.Cluster

![proto.cluster](images/Cluster-2-blue.png)

<small>[Homage to Proto.Actors Swedish roots, Swedish midsummer ring dance - Connected Cluster Actors]</small>

## Virtual Actors, aka. Grains

Proto.Cluster leverages the _"Virtual Actor Model"_, which was pioneered by Microsoft Orleans.
Unlike the traditional Actor Model used in Erlang or Akka, where developers must care about actor lifecycles, placement and failures.
The virtual actor model instead focus on ease of use, high availability where most of the complexity have been abstracted away from the developer.

> The Microsoft Orleans website describes this as _A straightforward approach to building distributed, high-scale applications in .NET_.

![grains](images/grains.png)

**Proto.Actor** combines this way of clustering, with the traditional actor model to combine the best of both worlds.
This allows us to create huge clusters of stateful services where the virtual actors acts as entry points which in turn can contain entire graphs of local actors.

This offers us a unique way to optimize for data locality, while still offering ease of use at scale.

Just like everything else in Proto.Actor where we have re-used proven technologies such as Protobuf and gRPC, we do the same for clustering, we do not reinvent the wheel and create our own cluster mechanics.
Instead, we leverage proven technologies such as Consul, ETCD or Kubernetes to power our Cluster member management.

The short version of what virtual actors are, is that they are abstractions on top of plain actors.
They are spawned _somewhere_ in your cluster, and their lifecycle is managed by the cluster instead of you.

This means that you as a developer, don't have to care or know if the actor already exists or where it exists.
You address it using its identity and kind and the cluster does the rest for you.

## Getting started

If you're new to the concept of virtual actors / grains, it's highly recommended that you take a look at a tutorial:

[Getting Started With Grains / Virtual Actors (.NET)](cluster/getting-started-net.md)

## Proto.Cluster components

Proto.Cluster consists of a few main components that come together and provide virtual actor cluster functionality.

* Cluster Kind - wrapper over [Props](props.md) that instructs the cluster how to create actors

* Remote Configuration - describes how to reach member in the cluster network and how to serialize messages, more details might be found [here](remote.md)

* Cluster provider - abstraction that provides with information about available members in the cluster, more details might be found [here](cluster/cluster-providers-net.md)

* Gossip - the way how members shares information about each member's state, more details might be found [here](cluster/gossip.md)

* Actor Cache - set of recently used actor references cached in member's memory to speed up access to it

* Identity Lookup - component that is responsible for placing actor on specified member, more details might be found [here](cluster/identity-lookup-net.md)

Components join together to provide more advanced functionalities that are essential for the cluster to work correctly.

![proto.cluster overview v1](cluster/images/proto-cluster-overview.jpg)