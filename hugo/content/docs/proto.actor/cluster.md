---
title: "Grains"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Proto.Cluster

## Virtual Actors

Proto.Cluster leverages the "Vritual Actor Model", which was pioneered by Microsoft Orleans.
Unlike the traditional Actor Model used in Erlang or Akka, where developers must care about actor lifecycles, placement and failures.
The virtual actor model instead focus on ease of use, high availability where most of the complexity have been abstracted away from the developer.

The Microsoft Orleans website describes this as *A straightforward approach to building distributed, high-scale applications in .NET*.

Proto.Actor combines this way of clustering, with the traditional actor model to combine the best of both worlds.
This allows us to create huge clusters of stateful services where the virtual actors acts as entry points which in turn can contain entire graphs of local actors.

This offers us a unique way to optimize for data locality, while still offering ease of use at scale.

Just like everything else in Proto.Actor where we have re-used proven technologies such as Protobuf and gRPC, we do the same for clustering, we do not reinvent the wheel and create our own cluster mechanics.
Instead, we leverage proven technologies such as Consul.

For more information about the details of cluster mechanics.
See [Cluster Partitions](cluster-partitions.md)

## FAQ

### Communicate with Virtual Actors

In order to send messages to a virtual actor, you need to get hold of the `PID`.

You do this using the `Cluster.GetAsync("name","kind")` in C#, and `cluster.Get("name","kind")` in Go.

This gives you the PID, *and* a status.
e.g. the status could tell you that the specific Kind you requested are not yet available, possibly due to no such node having joined the cluster yet.

This allows you to re-try getting the PID by calling the Cluster.Get untill it succeeds.

It is also important to understand that the PID should be treated as a transient resource in this case, do not store it or pass it around.
The PID only points to the current activation of the actor, and can very well change over time.

The idiomatic way is to always call Cluster.Get whenever you want to reach a virtual actor.

### Generate Typed Virtual Actors

//TODO

Show examples how to codegen grains

## Hybrid Clusters: C#, Go and Kotlin

//TODO

## Technical Details

//TODO Hashing algorithm