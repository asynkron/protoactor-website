---
layout: docs.hbs
title: Identity Lookup (.NET)
---

# Identity Lookup (.NET)

Identity lookup allows the Proto.Cluster to use different strategies to locate virtual actors. Depending on the use case, different strategy will be suitable.

Possible implementations:

* [Partition Identity Lookup](partition-idenity-lookup.md)

* [Partition Activator Lookup](partition-activator-lookup.md)

* [DB Identity Lookup](db-identity-lookup.md)

## Actor placement strategies

It is possible to choose between two actor placement strategies. Strategy might be selected for each cluster kind.

``` csharp

var clusterKind = new ClusterKind("someKind", someKindProps)
                    .WithMemberStrategy(cluster => new SomeCustomStrategy(cluster));

```

### SimpleMemberStrategy (default)

This strategy is the default strategy. It uses round-robin algorithm to select the member to spawn an actor.

### LocalAffinityStrategy

It tries to spawn an actor on the same member as sender. If it fails then it tries to select a member using round-robin algorithm.

This strategy might be very useful in event stream processing cases, e.g. when member reads from kafka partition and partition key is also actor's identity. It results in reducing needed grpc calls between members.

```csharp

var clusterKind = new ClusterKind("someKind", someKindProps)
                    .WithLocalAffinityRelocationStrategy(new LocalAffinityOptions
                    {
                        TriggersLocalAffinity = envelope => 
                            envelope.Message is GrainRequestMessage { RequestMessage: MessageTypeThatShouldTriggerRelocation },
                        RelocationThroughput = new ThrottleOptions(
                            MaxEventsInPeriod: ParseInt(config["LocalAffinityMaxEventsInPeriod"]),
                            Period: ParseTimeSpan(config["LocalAffinityPeriodSeconds"]))
                    });

```

When rebalancing partitions on members leaving or being added, existing identity activations may end up on another member than the partition containing its messages. In order to keep local affinity, these activations needs to be moved.

To support this, we have configurable middleware which can control which messages trigger relocation, and the max throughput of these relocations. This limits potential issues caused by too many actors spawning simultaneously, overloading the backing database.

When relocating, the current messages are always processed first, then the actors are stopped on the "wrong" member before being respawned on the member of the message sender.

* `LocalAffinityOptions.TriggersLocalAffinity` - delegate that checks if relocation process check should be fired for a given message, e.g. to not relocate when message is coming from non-partitioned source (outside kafka)

* `LocalAffinityOptions.RelocationThroughput` - controls the throughput of actor relocations, to prevent spawning actors from overloading external state stores.
