Proto.Actor Bootcamp Tutorial Series

Chapter 1: Introduction to the Actor Model and Proto.Actor
The actor model is a conceptual model for designing concurrent, distributed systems. In the actor model, an actor is a lightweight entity that encapsulates state and behavior, and communicates exclusively by exchanging messages. Actors do not share memory; instead, they send messages to each other asynchronously. This eliminates the need for locks or manual thread management, since each actor processes one message at a time in a single-threaded manner. The actor model provides a high-level abstraction for concurrency, making it easier to build systems that are responsive, resilient, and elastic (as advocated by the Reactive Manifesto). Key benefits of using the actor model include:

Simplified Concurrency: No explicit threads or locks — actors run independently and handle messages sequentially, avoiding race conditions by design.

Isolation of State: Each actor’s state is encapsulated and not accessible directly by others, ensuring memory safety and easier reasoning about state changes.

Location Transparency: Actors are identified by addresses. Sending a message to an actor uses its address (or PID) without needing to know the actor’s location (local or remote). This enables distribution and scaling across multiple machines seamlessly.

Fault Tolerance via Supervision: Actors form hierarchies. An actor can create child actors and supervise them. If a child actor fails (e.g., throws an exception), the parent actor can handle the failure (restart the child, replace it, etc.), creating a self-healing system.

In the context of Proto.Actor, these principles are applied in a modern, cross-platform framework. Proto.Actor is an open-source actor framework available in multiple languages (including .NET/C# and Go) that implements both classic actors and “virtual actors” in clusters. It provides the building blocks to create actors, send messages, and scale out your system across cores and network nodes. Proto.Actor uses proven technologies under the hood (like gRPC for networking and Protocol Buffers for serialization) instead of reinventing them
GitHub
GitHub
. This means Proto.Actor integrates well with other systems and languages, allowing, for example, a Go actor to communicate with a C# actor over the network with ease.

 

A virtual actor (or grain, in Proto.Actor terminology) is a concept used in distributed clusters (inspired by Microsoft Orleans). Virtual actors abstract away the manual creation and placement of actors in a cluster. Instead of explicitly spawning an actor on a specific node, you as a developer simply send a message to a cluster identity (a logical name for the actor), and the cluster ensures an actor instance exists to receive that message
GitHub
GitHub
. The first time a message is sent to a given identity (e.g., “user/123”), Proto.Actor’s cluster will automatically activate an actor for that identity on an available node. This actor is then kept alive to process subsequent messages, and if the hosting node goes down, the cluster can transparently recreate the actor on another node. We will delve into virtual actors in the cluster chapter, but it’s important to know that Proto.Actor supports both traditional actor usage (where you manage actor lifecycles in your process) and virtual actors (where the cluster manages lifecycles for you).

 

In summary, the actor model provides a robust mental model for concurrent systems, and Proto.Actor brings this model to practical use in C#, Go, and other languages. By using Proto.Actor, you gain:

High-level concurrency primitives – focus on actors and messages rather than threads and locks.

Scalability – design locally, then scale out to multiple processes or machines with Proto.Actor’s remote and cluster features without code changes.

Polyglot and distributed capabilities – build parts of your system in different languages or deploy actors on different nodes; Proto.Actor’s networking ensures they work together as if they were in one process.

Resilience – let actor supervision strategies handle errors and restarts, creating systems that can heal and adapt at runtime.

Below is a simple diagram illustrating how actors communicate and process messages sequentially using a mailbox:

sequenceDiagram
    participant Sender as Sender Actor
    participant Mailbox as Receiver's Mailbox
    participant Receiver as Receiver Actor
    Sender->>Mailbox: Enqueue Message 1
    Sender->>Mailbox: Enqueue Message 2
    Note over Mailbox: Mailbox queues messages
    Mailbox->>Receiver: Deliver Message 1
    Note over Receiver: Receiver processes Message 1 (one at a time)
    Mailbox->>Receiver: Deliver Message 2 (after Message 1 done)
    Note over Receiver: Receiver processes Message 2


This diagram shows that a sender actor can put multiple messages into the receiver’s mailbox quickly, but the receiver will dequeue and handle them one by one. This ensures thread-safe processing within the actor. In the next chapters, we will build on these concepts: first by exploring Proto.Actor’s core primitives for defining and using actors, then by leveraging remote communication, clustering (with virtual actors), and finally how to test actor systems using Proto.Actor’s toolkit. Each chapter includes examples in both C# and Go, plus diagrams to solidify the concepts.

Chapter 2: Proto.Actor Core Primitives
Now that we understand the basic actor model, let’s see how Proto.Actor implements these concepts and what core primitives it provides. We will cover how to define an actor’s behavior, how to create and start actors, how actors send and receive messages, and how the actor lifecycle and hierarchy work. We’ll illustrate with simple examples in C# and Go.

Actors, Messages, and the Actor System

In Proto.Actor, an actor is an object that encapsulates state and behavior. In C#, you define an actor by implementing the IActor interface (which requires a ReceiveAsync(IContext) method). In Go, an actor is any type that implements the actor.Actor interface (with a Receive(actor.Context) method). Actors communicate by sending messages – these can be plain objects, or often Proto.Actor uses Protobuf-generated message classes for cross-network communication.

 

All actors live within an ActorSystem – this is the runtime that tracks actors and delivers messages. You typically create one ActorSystem per application (per process). The ActorSystem provides a Root Context (RootContext in C#, or system.Root in Go) which is like a top-level context for interacting with actors from “outside” (e.g. from your Main method or tests). You use the root context to spawn the first actors in the system. Each actor, when running, receives a context object (IContext in C#, or actor.Context in Go) that it uses to get information (like the sender of a message, or its own PID) and to perform actions (like spawning child actors, sending responses, etc.).

 

Message definitions: Messages can be defined as simple classes/structs. They should be immutable (especially if they might be shared across threads) to avoid concurrent modification issues
proto.actor
proto.actor
. For example, in C# you might define:

// C# - define a message as an immutable record or class
public record Greet(string Who);


And in Go:

// Go - define a message struct
type Greet struct { Who string }


This Greet message carries a name to be greeted. We’ll use this in a simple actor example below.

Defining an Actor’s Behavior

An actor’s behavior is defined by how it handles messages one at a time. In Proto.Actor, you typically write this as a function or method that inspects the incoming message and acts on it. For example, let’s create a simple actor that greets people by printing a hello message when it receives a Greet message:

 

C# Example – Defining a simple actor:

using Proto;
using System;

public class GreetingActor : IActor
{
    public Task ReceiveAsync(IContext ctx)
    {
        // Check the type of the incoming message
        if (ctx.Message is Greet greet)
        {
            Console.WriteLine($"Hello {greet.Who}!");  // actor’s action on Greet
        }
        return Task.CompletedTask;
    }
}


In this C# actor, we implement IActor.ReceiveAsync. We use ctx.Message to get the current message. If it’s a Greet, we print a greeting. Processing is quick and non-blocking here (returning a completed Task).

 

Go Example – Defining a simple actor:

package main

import (
    "fmt"
    "github.com/asynkron/protoactor-go/actor"
)

// Define an actor type by implementing actor.Actor interface
type greetingActor struct{}

// Receive is called for each incoming message
func (g *greetingActor) Receive(ctx actor.Context) {
    switch msg := ctx.Message().(type) {
    case *Greet:
        fmt.Printf("Hello %s!\n", msg.Who)
    }
}


In Go, our greetingActor type’s Receive method uses a type switch on ctx.Message() to handle the *Greet message. We use fmt.Printf to output the greeting.

 

Note: In both languages, we pattern-match on message types. This is a common pattern – an actor often handles different message types (including system messages like Started, Stopped, etc.). Here we only care about our custom Greet message.

Spawning Actors

To create (spawn) an actor, we need a Props – a configuration for the actor. Props in Proto.Actor includes the actor factory (how to instantiate the actor), plus optional middleware, mailbox configuration, etc. For now, we’ll use basic Props.

In C#, you get a Props with Props.FromProducer(() => new GreetingActor()).

In Go, you use actor.PropsFromProducer(func() actor.Actor { return &greetingActor{} }).

Once you have Props, use the ActorSystem’s RootContext to spawn the actor. Spawning returns a PID (Process ID), which is the actor’s address/reference. Think of a PID as an opaque pointer or handle to the actor – it contains the actor’s ID and location information.

 

C# Example – Spawning and using an actor:

using Proto;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var system = new ActorSystem();                        // create the ActorSystem
        var props = Props.FromProducer(() => new GreetingActor());
        PID pid = system.Root.Spawn(props);                    // spawn actor, get its PID

        // Send a message to the actor:
        system.Root.Send(pid, new Greet("World"));

        // Give some time for the actor to process before ending (since it’s async)
        await Task.Delay(500);
    }
}


When you run this, the GreetingActor will receive the Greet("World") message and print “Hello World!” to the console. We used system.Root.Send to send the message in a “fire-and-forget” manner. The actor processes it asynchronously. We waited a short moment to ensure the message is processed before the program exits (since in a console app, Main might end before the actor prints). In a long-running app, this delay isn’t needed.

 

Go Example – Spawning and using an actor:

import (
    "github.com/asynkron/protoactor-go/actor"
    "time"
)

func main() {
    system := actor.NewActorSystem()                                 // new ActorSystem
    props := actor.PropsFromProducer(func() actor.Actor { return &greetingActor{} })
    pid := system.Root.Spawn(props)                                  // spawn the actor

    // Send a message to the actor
    system.Root.Send(pid, &Greet{Who: "World"})

    // Prevent the program from exiting immediately (to allow actor to process message)
    time.Sleep(500 * time.Millisecond)
}


This Go example does the equivalent: it creates an actor system, spawns the greetingActor, and sends a Greet{Who: "World"} message to it. The actor will print “Hello World!” to stdout. We sleep briefly to ensure the print occurs before the program terminates.

 

Both examples demonstrate the core workflow of Proto.Actor: define an actor’s behavior, spawn the actor, then send it messages via its PID. The RootContext (system.Root) is used here to spawn and communicate with the actor from the outside. Within an actor, if it needs to create child actors, it would use its own context (ctx.Spawn(...)), and for sending messages to other actors it could use ctx.Send(pid, message) or ctx.Request(pid, message) (the latter when expecting a response).

Actor References (PID) and Addressing

When you spawned the actor, you got a PID. The PID (Process ID) is a core primitive in Proto.Actor that uniquely identifies an actor. It contains:

an Address (which can be an empty string for local actors, or “remoteaddress:port” for remote ones), and

an ID (a unique ID for the actor instance, often an auto-generated string or the name you assign if you use SpawnNamed).

For example, a PID might look like Pid{ Address="", Id="Actor$123" } for a local actor, or { Address="127.0.0.1:8000", Id="remoteActor" } for a remote actor on another process. PIDs are how you send messages – you don’t call methods on an actor, you send it messages via its PID. The actor’s mailbox receives the message and eventually the actor’s Receive handles it. This indirection is what enables location transparency: if the actor moves or is actually remote, you still just have a PID. The Proto.Actor infrastructure handles delivering the message to wherever the actor lives (more on this in the Remoting chapter).

 

You can obtain a PID by spawning an actor (which returns it), by looking one up by name (if you spawned with a name or registered a name in a naming system), or via cluster identity (discussed in the Cluster chapter). PIDs can also be shared: you can send a PID to another actor as part of a message (e.g., send your PID so the receiver can reply directly).

Actor Lifecycle and Context

Proto.Actor actors have a well-defined lifecycle. They go through stages such as Started, Running, and Stopped. When an actor is first spawned, the framework automatically sends it a Started message (of type actor.Started in Go or a Started instance in C#) before any user messages. This allows the actor to perform initialization. For example, if you need to set up some state or spawn child actors at start, you can handle the Started message in your Receive method. Similarly, when an actor is about to stop, it can receive a Stopping and Stopped message. Proto.Actor ensures all of these system messages are delivered in order with respect to other messages.

 

The context (IContext in C#, actor.Context in Go) passed to the actor’s receive method provides methods to interact with the actor system during those lifecycle events and beyond:

ctx.Self – the PID of the current actor (itself).

ctx.Sender – the PID of the actor that sent the current message (if available). Using ctx.Respond(msg) in C# (or ctx.Respond(msg) in Go) will send a response back to the Sender.

ctx.Spawn(props) – spawn a new child actor under the current actor. The new actor’s parent will be the current actor, meaning if the current actor stops, it will stop its children as well.

ctx.Stop(targetPid) – stop a child actor (or you can stop ctx.Self to stop itself). Stopping an actor will eventually send it a Stopped message and terminate it after it processes current messages.

ctx.SetReceiveTimeout(duration) – if set, if the actor doesn’t receive any message for the given duration, it will get a ReceiveTimeout message. This is useful to implement auto-shutdown of idle actors, etc.

ctx.Forward(pid, message) – forward the exact message (and original sender) to another actor.

ctx.Watch(targetPid) – watch another actor; you will get a Terminated message if that actor stops (this is useful for monitoring lifecycles).

These are just a few highlights of the context API. The context is powerful: it’s your interface to the actor system from within the actor. For example, an actor can spawn children to delegate work, and if a child crashes, the parent will be notified via a Terminated message – at which point the parent can decide to spawn a new child or handle the error. This ties into supervision.

Actor Hierarchy and Supervision Basics

Actors form a hierarchy: whenever you spawn an actor from within another actor, the spawner becomes the parent and the new actor is its child. The root context spawns top-level actors whose parent is a guardian system actor (Proto.Actor has an internal guardian for user actors). This hierarchy has two main benefits: structured system organization and supervision for fault tolerance.

 

Supervision means that a parent actor is responsible for handling failures of its children. If a child actor throws an exception or fails to process a message, Proto.Actor will stop the child and notify the parent (the parent receives a Terminated message for that child, with a failure reason). By default, Proto.Actor (like the Erlang model) uses a “let it crash” philosophy – you usually don’t catch exceptions inside the actor; instead, if an unrecoverable error happens, the actor can crash and be restarted by a supervisor. Proto.Actor lets you define supervision strategies for your actors (for example, restart the child, stop it, escalate the failure to the parent’s parent, etc.). The default strategy in Proto.Actor is to restart the child actor on failure a certain number of times (or stop it if it exceeds a restart limit)
GitHub
GitHub
. This way, your system can recover from errors without bringing down the entire process. For example, if one actor responsible for a specific task crashes, its parent can restart it fresh, while other actors continue unaffected.

 

Here’s a simple diagram of a small actor hierarchy with a parent supervising two children:

flowchart TB
    Parent([Parent Actor])
    Child1([Child Actor 1])
    Child2([Child Actor 2])
    Parent --> Child1
    Parent --> Child2


In this hierarchy, if Child Actor 1 encounters an error, the Parent can decide what to do – perhaps restart Child1 (create a new instance of it) while keeping Child2 running. This makes the system resilient, as localized failures don’t spill over beyond the parent’s scope. Proto.Actor’s supervision strategy can be customized via Props.WithSupervisor(...) in C#, or similar configuration in Go, but for most cases the default works out of the box.

Summary of Core Concepts

ActorSystem – the container for actors; provides the Root context for spawning actors.

Actor (IActor / actor.Actor) – your entity processing messages via a Receive method.

Message – data or command sent to actors (usually immutable).

PID (Actor PID) – address/reference to an actor, used to send messages.

Context (IContext / actor.Context) – provides methods and info for the actor to interact with the system (sending/receiving, spawning children, etc.).

Props – configuration for creating an actor (at minimum, the actor factory).

Parent/Child and Supervision – actors form a tree; parents supervise children for errors.

With these basics, you can already build concurrent applications that make use of multiple actors communicating in-process. In the next chapter, we will extend this to distributed scenarios. Proto.Actor’s Remoting allows actors in different processes or machines to send messages to each other as easily as if they were local. We’ll explore how to configure and use Proto.Actor’s remote capabilities.
