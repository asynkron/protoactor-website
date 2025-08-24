# Chapter 4: Why Use a Cluster?

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

[Back to Chapter 4](../)

Imagine you have a service that maintains user sessions or game characters. With just Proto.Remote, you could spawn these actors on some nodes and keep a directory of where each user’s actor is. But you’d have to design that directory, handle what happens if a node goes down (and the actors on it are lost), and route messages to the right node. Proto.Cluster automates these tasks. It provides:

- Dynamic membership: Nodes can join or leave the cluster, and the cluster will redistribute actors as needed.
- Virtual actors (grains): You don’t manually spawn these actors. Instead, when you send a message to an identity, the cluster ensures an actor exists (spawning it on-demand on some node if it’s the first message).
- Location transparency at scale: You address actors by (kind, identity) pair rather than by PID. The cluster’s identity lookup maps that to a real PID under the hood. If the actor moves or gets re-created, the mapping updates, but you keep using the same identity.
- Built-in naming and routing: The cluster prevents duplicate actors with the same identity from running concurrently (unless you configure it otherwise). It handles deciding which node should host a new activation (often via a hash or random distribution, or by delegation to a cluster provider).
- Fault tolerance: If a node crashes, the cluster can recreate the needed actors on other nodes once it detects the failure, so the system continues working (albeit those actors might start fresh unless you use persistence).

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

