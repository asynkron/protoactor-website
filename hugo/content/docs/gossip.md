# Cluster Gossip


## GossipState
Each member has a `GossipState`, this state is made up of a dictionary of `MemberId` to `GossipMemberState` objects
`GossipMemberState` objects are in turn dictionaries of keys, system and user defined, mapping to a `Protobuf.Any` state.

This means we can have a `GossipMemberState` object for "member123".
Inside this member state object, we can have entries for known payloads.
e.g. "topology", "heartbeat", "banned-members" etc.

This state is replicated from the owner member to other members of the cluster via gossip.
State is always defined per member, allowing us to know what other members see and know.

To get a complete view of say banned-members, we could take the banned-member entry from each member, and merge those results. giving us an eventual consistent set of banned members.

![Gossip](/images/gossip.png)

## Committed Offsets
Each member has a dictionary of *committed offsets* for itself, and all other known members.
These offsets represent the highest `SequenceNumber` this node have seen for a given key.

Keys are made up of `MemberId` and `StateEntryKey`

e.g.
* **"Member1234.topology" : 123**
* **"Member1234.heartbeat" : 567**

During the gossip transmission, the sender member will transfer a delta of all state changes from what the sender knows that the target knows, upto what the sender believes the target doesn't know.

The sender member can _know_ that some state has been transmitted to the target, we know this via the `CommittedOffsets`, the sender does not however know if any of the state after this point, has already been transmitted by any other node, unless they have gossipped this to the sender that is.



![Gossip](/images/gossipoffsets.png)


## Gossip fan-out

Gissip between member nodes occur at intervals and target members are picked at random with a selection of `ClusterConfig.GossipFanout` number of members.


![Gossip](/images/gossipfanout.png)