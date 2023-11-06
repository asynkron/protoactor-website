# Lesson 5: Key features of the Proto.Actor.

In previous lessons, we got a basic understanding of the actor model and Proto.Actor. Let's consider the key features of the Proto.Actor platform.

Proto.Actor offers us the following:

- Simple multithreading and asynchronous (concurrency and asynchronous)
- Simple distributed processing (distribution)
- High performance
- Fault Tolerance
- Ability to use multiple programming languages in a single application (multiple languages)

### Concurrency and asynchronous.

We work with high levels of abstraction, such as actors, messages, and Finite-state machines. We also work with parallelism at a high level of abstraction, so we do not need to perform low-level operations such as manual control, threads, and blocking shared resources. Because message passing is an asynchronous operation, we get the ease of interaction between actors running in parallel and avoid blocking the actor while waiting for a response from another actor.

### Distributed processing.

The concept of location transparency, which we will focus on in more detail, essentially means that it does not matter where the individual actor instances are. They can be on the same or another machine.

Proto.Actor also provides a simple remote spawn model to spawn actors on remote or cluster members.

### High performance.

Proto.Actor has high performance; you can expect to handle about 50 million messages per second per machine. However, actual performance will depend on the machine we run because of overheads on actor management. We expect to create about 2.5 million instances of actors per gigabyte of memory.

Proto.Actor also has features such as load balancing and routing messages to multiple child instances of the actor.

### Fault Tolerance.

Proto.Actor allows us to create self-repairing systems using the concept of a supervisor hierarchy. If an error occurs in any part of the system, we isolate it from the rest and tell the system how to self-recover.

### Ability to use multiple programming languages in a single application.

A key feature of Proto.Actor is the ability to write a single application in multiple programming languages. Thanks to gRPC, actors written in different programming languages can easily exchange messages with each other. For example, write the client part using ASP.NET Core and the server part in Python. Communication between the server and client parts will be transparent for you.

[Go ahead!](../lesson-6)
