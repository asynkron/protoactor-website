---
layout: docs.hbs
title: Identity Lookup (.NET)
---

# Identity Lookup (.NET)

Identity lookup allows the Proto.Cluster to use different strategies to locate virtual actors. Depending on the use case, different strategy will be suitable.

Possible implementations:

* [Partition Identity Lookup](partition-idenity-lookup.md)

* [Parition Activator Lookup](partition-activator-lookup.md)

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

In the cluster, members might go down and up so it is needed also to relocate actors between members to keep local affinity. It is possible to control relocation process. Relocating too many actors in the same time might case that the whole cluster is unstable.

* `LocalAffinityOptions.TriggersLocalAffinity` - delegate that checks if relocation process check should be fired for a given message, e.g. to not relocate when message is comming from non-partitioned source (outside kafka)

* `LocalAffinityOptions.RelocationThroughput` - controls a throughput of relocation to not relocate too many actors in the same time
