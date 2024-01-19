---
layout: docs.hbs
title: Member strategies
---


# Member strategies

A member strategy decides which member will activate a new instance of a specific actor kind. You can choose a strategy for each actor kind separately.

*Note: The member strategy is ignored when using Partition Activator Lookup, because in this case a member is selected by the consistent hashing algorithm*

There are two strategies available out of the box and there's a possibility to implement a custom one.

## SimpleMemberStrategy (default)

The default strategy uses round-robin algorithm to select the member to spawn an actor. If no other strategy is specified, this one will be used by default.

```csharp
var clusterKind = new ClusterKind("someKind", someKindProps);
```

## LocalAffinityStrategy

It tries to spawn an actor on the same member as sender. If that fails then it tries to select a member using round-robin algorithm.

This strategy might be very useful in cases like
- Event stream processing: When member reads from Kafka partition and partition key is also actor’s identity. It reduces number of network calls between members.
- Spawning grains in selected members: While using the cluster discovery services like Kubernetes or Consul, grains can be spawned in any of the members by default. But when we want to spawn the grain only the specific member, receiving request from the external traffic (like any network stream, etc), we can use this strategy. 

[Read more about the Local Affinity pattern.](../local-affinity.md)

```csharp
var clusterKind = new ClusterKind("someKind", someKindProps)
    .WithLocalAffinityRelocationStrategy(
        new LocalAffinityOptions
        {
            TriggersLocalAffinity = 
                envelope => envelope.Message is not MyRestApiRequest,
            RelocationThroughput = 
                new ThrottleOptions(MaxEventsInPeriod: 100, Period: TimeSpan.FromSeconds(1))
        });
```

Apart from configuring the member strategy, the code above will also install a configurable middleware on the actor props, that controls which messages trigger relocation and limits the number of relocations in a period of time.

`LocalAffinityOptions.TriggersLocalAffinity`

For each message, this delegate allows to decide if the specific message may trigger relocation process. Useful, when actors also receive messages from non-partitioned sources (e.g. initiated from REST API call). If the delegate returns false, the message will not participate in the local affinity mechanism. If not specified, by default all messages participate.

*Note: If you are using code generated grains, the messages passed to the delegate will be wrapped in `GrainRequestMessage` envelopes. Extract the actual message type from `GrainRequestMessage.RequestMessage` property.*

`LocalAffinityOptions.RelocationThroughput`

Controls the throughput of actor relocations, to prevent the spawning actors from overloading external state stores. If not specified, no throttling occurs.

Also, while using the `LocalAffinityRelocationStrategy` configuration, don't forget to use `ClusterKind.WithPidCacheInvalidation()`, so that other cluster members get an information when the actor/grain has been relocated.

## Custom strategy

Implement a custom member strategy by implementing the `IMemberStrategy` interface, then use it in the configuration:

``` csharp
var clusterKind = new ClusterKind("someKind", someKindProps)
                    .WithMemberStrategy(cluster => new SomeCustomStrategy(cluster));
```

## Overriding the default strategy

It's possible to override the default member strategy across all kinds in the cluster configuration:

```csharp
ClusterConfig
    .Setup(clusterName, clusterProvider, new PartitionIdentityLookup())
    .WithMemberStrategyBuilder((cluster, kind) => new SomeCustomStrategy(cluster));
```