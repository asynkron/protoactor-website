---
layout: docs.hbs
title: EventStream
---
# EventStream

The EventStream is used internally in Proto.Actor to broadcast framework events.

## DeadLetter
**Events**
* `actor.DeadLetter`

When a message is sent to a non-existing `actor.PID`, the message will be forwarded to the `actor.EventStream` as a `actor.DeadLetter`.
This can be used to monitor if your system holds on to broken/expired `actor.PID`s.

{{< note >}}
Learn more about DeadLetters [here](deadletter.md).
{{</ note >}}

## Remote termination
**Events**
* `remoting.EndpointTerminated`

When an endpoint terminates, the remoting layer will send a `remoting.EndpointTerminated` event.
This can be used if you need to know about your current network topology.
This event is also used to trigger `actor.Terminate` events for remote watched actors.

![Cluster Events](images/remoteterminate.png)

## Cluster topology
**Events**
* `cluster.MemberStatusBatch`
* `cluster.MemberStatusEvent` - *Interface*
* `cluster.MemberJoinedEvent` - *Implements `cluster.MemberStatusEvent`*
* `cluster.MemberRejoinedEvent` - *Implements `cluster.MemberStatusEvent`*
* `cluster.MemberLeftEvent` - *Implements `cluster.MemberStatusEvent`*
* `cluster.MemberUnavailableEvent` - *Implements `cluster.MemberStatusEvent`*
* `cluster.MemberAvailableEvent` - *Implements `cluster.MemberStatusEvent`*

### Usages

#### Cluster Provider
In clustering, the `cluster.ClusterProvider`s broadcast `cluster.MemberStatusBatch` messages to inform the system about the current cluster topology.

#### MemberListActor
The member list actor use the `cluster.MemberStatusBatch` to calculate a delta of topology changes and refine this information into `cluster.MemberStatusEvent` messages.

#### PartitionActor
The `cluster.MemberStatusEvent` messages are handled by the `cluster.PartitionActor`'s to determine if virtual actor ownership should be handed over to other nodes.

![Cluster Events](images/clusterevents.png)
