# Chapter 3: Remoting with Proto.Actor (Proto.Remote)

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

Thus far, our actors have all been within a single process. One of the powerful features of Proto.Actor is that it supports location transparency not just in theory but in practice: you can have actors running on different machines (or processes) communicate with each other. Proto.Actor’s Remoting module (often referred to as Proto.Remote) provides the networking layer to send messages between actor systems over the network (using gRPC under the hood). In this chapter, we cover how to set up remoting, how remote actors are addressed, and a simple example of sending messages between two processes (in C# and Go).

## Why Remoting?
Remoting enables horizontal scaling and distribution of work. Suppose you have more work than a single process can handle, or you want to build a system where different services (like a login service and a payment service) run in separate processes. With Proto.Remote, those different actor systems can still talk to each other seamlessly. You might start with a single-node system and later decide to run multiple instances; using remoting, you can distribute actors across nodes without changing how you send messages. This is the foundation for building clusters (which we’ll expand on in the next chapter).

## Key aspects of Proto.Remote:
- It uses gRPC for transport (which means it’s efficient and supports cross-language communication).
- It uses Protocol Buffers (Protobuf) for serializing messages by default. You define your message schemas in .proto files so that both sender and receiver know how to serialize/deserialize the messages.
- Actors are identified by an address:port and a name (the PID contains these). If an actor is known by name on a remote node, you can send it messages by constructing a PID with that node’s address and the actor’s name.
- You can also spawn actors remotely – meaning from one node, instruct another node to create an actor of a given kind. Proto.Remote allows registering “kinds” of actors that can be spawned remotely.

For setup details see [Configuring Proto.Remote](configuration/). Example code is available in [Remote Examples](examples/).

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

