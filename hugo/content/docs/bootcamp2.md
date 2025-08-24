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

Chapter 3: Remoting with Proto.Actor (Proto.Remote)
Thus far, our actors have all been within a single process. One of the powerful features of Proto.Actor is that it supports location transparency not just in theory but in practice: you can have actors running on different machines (or processes) communicate with each other. Proto.Actor’s Remoting module (often referred to as Proto.Remote) provides the networking layer to send messages between actor systems over the network (using gRPC under the hood). In this chapter, we’ll cover how to set up remoting, how remote actors are addressed, and a simple example of sending messages between two processes (in C# and Go).

Why Remoting?

Remoting enables horizontal scaling and distribution of work. Suppose you have more work than a single process can handle, or you want to build a system where different services (like a login service and a payment service) run in separate processes. With Proto.Remote, those different actor systems can still talk to each other seamlessly. You might start with a single-node system and later decide to run multiple instances; using remoting, you can distribute actors across nodes without changing how you send messages. This is the foundation for building clusters (which we’ll expand on in the next chapter).

 

Key aspects of Proto.Remote:

It uses gRPC for transport (which means it’s efficient and supports cross-language communication).

It uses Protocol Buffers (Protobuf) for serializing messages by default. You define your message schemas in .proto files so that both sender and receiver know how to serialize/deserialize the messages
proto.actor
proto.actor
.

Actors are identified by a address:port and a name (the PID contains these). If an actor is known by name on a remote node, you can send it messages by constructing a PID with that node’s address and the actor’s name.

You can also spawn actors remotely – meaning from one node, instruct another node to create an actor of a given kind. Proto.Remote allows registering “kinds” of actors that can be spawned remotely
proto.actor
proto.actor
.

Configuring Proto.Remote

To use remoting, each process (actor system) needs to open a port and start a remote server. In C#, this is done by creating a GrpcNetRemoteConfig and adding it to the ActorSystem; in Go, by configuring remote.Configure. Typically, you will:

Register message types: Proto.Actor needs to know how to serialize your message classes. In C#, you call config = GrpcNetRemoteConfig.BindTo(host, port).WithProtoMessages(Descriptor), passing in the Protobuf descriptor for your messages
proto.actor
. In Go, you’d include remote.WithProtoFiles or ensure your Protobuf-generated Go types are registered. (For simplicity, if you’re only sending simple string or int messages, you might use built-in serialization, but Protobuf is recommended for compatibility).

Register actor kinds (for remote spawn): If you want to allow other nodes to spawn certain types of actors on this node, register them by name. In C#: .WithRemoteKind("echo", Props.FromProducer(() => new EchoActor())) adds an actor kind named "echo" with its creation logic
proto.actor
proto.actor
. In Go, there’s remote.Register("echo", actor.PropsFromProducer(...)) typically.

Start the remote: In C#, either call remote.Start() if using the older API (Remote class), or if using the new ActorSystem configuration API, you’d do system.Root.SpawnNamedAsync for remote spawn or simply rely on cluster (which auto-starts remote). In Go, call remoter := remote.NewRemote(system, config); remoter.Start().

For a basic example, let’s illustrate a simple ping-pong between two processes using Proto.Remote. We’ll create a PingActor on one node that, when pinged, responds with a pong message. A client on another node will send the ping and await the response.

Example: Remote Ping-Pong (C#)

Server (Node 1) – Host a Ping actor:

// On Node1 (Server)
using Proto;
using Proto.Remote;
using Proto.Remote.GrpcNet;

public class PingActor : IActor
{
    public Task ReceiveAsync(IContext context)
    {
        switch(context.Message)
        {
            case string text when text == "ping":
                context.Respond("pong");  // reply to sender
                break;
        }
        return Task.CompletedTask;
    }
}

var system = new ActorSystem();
// Configure remote on port 8000
var remoteConfig = GrpcNetRemoteConfig.BindTo("127.0.0.1", 8000)
    .WithProtoMessages(MyMessagesReflection.Descriptor)      // register Protobuf messages (if using custom types)
    .WithRemoteKind("pingKind", Props.FromProducer(() => new PingActor()));
system.WithRemote(remoteConfig);
await system.Remote().StartAsync();  // start the remote server

// Spawn the Ping actor with a known name, so it can be addressed remotely
var context = system.Root;
var pingProps = Props.FromProducer(() => new PingActor());
context.SpawnNamed(pingProps, "PingActor");  // name "PingActor"
Console.WriteLine("Ping actor started on Node1...");
Console.ReadLine();  // keep the server running


In the C# server code above, we started a Proto.Actor remote on TCP port 8000 and spawned a PingActor with the name "PingActor". By doing so, that actor can be referenced remotely via the PID PID("127.0.0.1:8000", "PingActor"). The actor simply responds with "pong" whenever it receives the string "ping". Note: We also registered a remote kind "pingKind" in remoteConfig, which would allow remote spawning of PingActor by kind if we wanted (though here we directly spawned it locally).

 

Client (Node 2) – Call the remote Ping actor:

// On Node2 (Client)
using Proto;
using Proto.Remote;
using Proto.Remote.GrpcNet;

var system = new ActorSystem();
var remoteConfig = GrpcNetRemoteConfig.BindTo("127.0.0.1", 0);  // 0 means choose a free port for this client
system.WithRemote(remoteConfig);
await system.Remote().StartAsync();  // start remote (client side)
Console.WriteLine("Remote client started.");

// Construct PID for remote actor
var pingActorPid = PID.FromAddress("127.0.0.1:8000", "PingActor");

// Send a ping and wait for response
var response = await system.Root.RequestAsync<string>(pingActorPid, "ping", TimeSpan.FromSeconds(5));
Console.WriteLine($"Got response: {response}");


In the client, we start a remote subsystem (with an ephemeral port). We then create a PID using the server’s address "127.0.0.1:8000" and the known name "PingActor". Using RequestAsync<T> on the root, we send a "ping" message and await a string response. The PingActor on the server will receive the message and Respond("pong"), which Proto.Actor sends back over the network to the requesting context on the client. The client prints “Got response: pong”.

 

Go Example: Remote Ping-Pong (Go code is conceptually similar – we would use remote.Configure and remote.Start):

 

Server (Go):

// Node1 (Server) in Go
package main

import (
    "fmt"
    "github.com/asynkron/protoactor-go/actor"
    remote "github.com/asynkron/protoactor-go/remote"
)

type pingActor struct{}

func (p *pingActor) Receive(ctx actor.Context) {
    if msg, ok := ctx.Message().(string); ok && msg == "ping" {
        ctx.Respond("pong")
    }
}

func main() {
    system := actor.NewActorSystem()
    // Configure remote on port 8090
    config := remote.Configure("127.0.0.1", 8090)
    // Create and start the remote server
    r := remote.NewRemote(system, config)
    r.Start()

    // Spawn the Ping actor with name
    props := actor.PropsFromProducer(func() actor.Actor { return &pingActor{} })
    system.Root.SpawnNamed(props, "PingActor")
    fmt.Println("Ping actor running at 127.0.0.1:8090 as 'PingActor'")
    select {} // block forever
}


Client (Go):

package main

import (
    "fmt"
    "time"
    "github.com/asynkron/protoactor-go/actor"
    remote "github.com/asynkron/protoactor-go/remote"
)

func main() {
    system := actor.NewActorSystem()
    config := remote.Configure("127.0.0.1", 0)  // 0 for any available port
    r := remote.NewRemote(system, config)
    r.Start()

    pid := actor.NewPID("127.0.0.1:8090", "PingActor")
    // Send ping and wait for reply using RequestFuture
    future := system.Root.RequestFuture(pid, "ping", 5*time.Second)
    result, err := future.Result()  // wait for response or timeout
    if err != nil {
        fmt.Println("Error: ", err)
        return
    }
    fmt.Printf("Got response: %v\n", result)  // expect "pong"
}


In the Go version, we similarly started a remote on the server (port 8090) and on the client (ephemeral). We used actor.NewPID("127.0.0.1:8090", "PingActor") to reference the remote actor by its address and name. Then we used RequestFuture to send a message and wait for a result. The server’s actor responds, and the client prints “Got response: pong”.

How Remoting Works (Under the Hood)

Proto.Remote automatically handles serialization and networking. When you send a message to a PID with a non-empty address (e.g., "127.0.0.1:8000"), the message goes through a serialization pipeline: if it’s a Protobuf message or a built-in type, it gets serialized to binary. The Proto.Actor Remote then sends it via gRPC to the target address. On the remote side, the message is deserialized and dispatched to the local actor. All of this is transparent to the user – from our perspective, we just did Send or RequestAsync with a PID and a message. This is location transparency in action.

 

The only extra steps needed are the configuration (to set up networking and serialization) and ensuring both sides know the message types (hence sharing Protobuf schemas or assemblies). In a multi-language scenario (say, a Go client and a C# server), using Protobuf for messages is essential so that both have a common definition of the data structures. As long as the Protobuf contracts are the same, a Go actor can send a message to a C# actor and vice versa.

Location Transparency and Remote Spawning

Location transparency means you could design your system without hard-coding where actors run. For instance, you might have an actor that does image processing – you can initially run it locally, but if load increases, you could run that actor on a separate machine and simply adjust addressing or use cluster (later). Proto.Remote even allows remote spawning: one node can ask another to spawn a new actor of a given kind. We touched on registering kinds earlier. For example, if Node2 wanted to spawn an actor on Node1, it could call something like system.Root.SpawnNamedAsync("127.0.0.1:8000", "someName", "pingKind") in C#
proto.actor
. This would instruct Node1’s remote system to create a new actor using the Props we registered as "pingKind". The returned PID would represent that new remote actor, and then we could send messages to it. Remote spawning is advanced usage that can be helpful, but often, if you’re building a dynamic system, you might use Proto.Cluster which automates a lot of that.

Diagram: Remote Message Flow

The following sequence diagram illustrates the interaction between two actors on different nodes using Proto.Remote, including an optional reply:

sequenceDiagram
    participant A as Actor A (Node1)
    participant R1 as Remote (Node1)
    participant R2 as Remote (Node2)
    participant B as Actor B (Node2)
    A->>R1: Send message (to PID of B on Node2)
    R1-->>R2: gRPC transmit message
    R2->>B: Deliver message to Actor B
    Note over B: B processes the message
    B-->>R2: (optional) send reply
    R2-->>R1: transmit reply via gRPC
    R1->>A: Deliver reply to Actor A


In this diagram, Actor A sends a message to Actor B’s PID. The Proto.Remote system on Node1 packages the message and sends it over the network to Node2. Node2’s remote system delivers it to Actor B. If Actor B calls Respond (or otherwise sends a message back to the original sender), the process reverses, delivering the reply to Actor A. The developer did not have to explicitly manage sockets or endpoints beyond the initial configuration – Proto.Actor’s remoting took care of it.

 

With Proto.Remote, you can build distributed applications where each service or component runs in its own process but still interacts through actors. However, remoting requires that you manage the node membership (i.e., knowing addresses of nodes and starting them manually). For dynamic clusters with many nodes joining/leaving and virtual actor activation, Proto.Actor offers the Cluster abstraction, which we cover next.

Chapter 4: Building Distributed Solutions with Proto.Cluster (Virtual Actors)
While Proto.Remote allows point-to-point communication between known nodes, Proto.Cluster builds on top of it to provide a higher-level abstraction for distributed systems: clusters of virtual actors. In Proto.Cluster, actors can be addressed by a logical identity (like “user/123”) rather than a physical PID. The cluster takes care of finding or activating an actor with that identity on some node, and routing messages to it. This greatly simplifies building scalable systems, as you do not need to manually track where each actor lives or whether it’s running – the cluster does it for you. In this chapter, we’ll explain key concepts of Proto.Cluster (cluster identities, kinds, membership, etc.), how virtual actors (grains) work, and how to configure and use a Proto.Actor cluster in C# and Go.

Why Use a Cluster?

Imagine you have a service that maintains user sessions or game characters. With just Proto.Remote, you could spawn these actors on some nodes and keep a directory of where each user’s actor is. But you’d have to design that directory, handle what happens if a node goes down (and the actors on it are lost), and route messages to the right node. Proto.Cluster automates these tasks. It provides:

Dynamic membership: Nodes can join or leave the cluster, and the cluster will redistribute actors as needed.

Virtual actors (grains): You don’t manually spawn these actors. Instead, when you send a message to an identity, the cluster ensures an actor exists (spawning it on-demand on some node if it’s the first message).

Location transparency at scale: You address actors by (kind, identity) pair rather than by PID. The cluster’s identity lookup maps that to a real PID under the hood
GitHub
GitHub
. If the actor moves or gets re-created, the mapping updates, but you keep using the same identity.

Built-in naming and routing: The cluster prevents duplicate actors with the same identity from running concurrently (unless you configure it otherwise). It handles deciding which node should host a new activation (often via a hash or random distribution, or by delegation to a cluster provider).

Fault tolerance: If a node crashes, the cluster can recreate the needed actors on other nodes once it detects the failure, so the system continues working (albeit those actors might start fresh unless you use persistence).

Proto.Actor’s clustering draws inspiration from the Orleans virtual actor model. In Orleans terms, a grain is an entity like an actor that is always addressed by its identity, not by where it is. Proto.Actor uses the term grain interchangeably with virtual actor. We’ll use “grain” when referring to the concept in cluster.

Key Concepts in Proto.Cluster

Cluster Identity: A combination of Kind and Identity. The Kind is a string that represents the type or role of the grain (e.g., "user", "order", "sensor"), and the Identity is a unique identifier for a specific grain of that kind (e.g., user ID, order ID, sensor ID). For example, user/123 has kind "user" and identity "123"
proto.actor
proto.actor
. Identities are unique per kind; two different kinds can have the same identity string without conflict.

Cluster Kind: A registration of an actor (Props) to a kind name in the cluster configuration. You define what code should run for a given kind. For instance, you might register kind "user" with the Props for a UserActor (which might manage a user’s session or state). Both .NET and Go cluster APIs have a way to set this up (e.g., ClusterConfig.WithClusterKind("user", Props.FromProducer(() => new UserActor())) in C#).

Cluster Provider: An implementation that keeps track of what nodes are in the cluster. Proto.Actor doesn’t hardcode the membership mechanism; instead, you plug in a provider (like a ConsulProvider, EtcdProvider, or a simple in-memory TestProvider for local dev)
GitHub
GitHub
. This provider is responsible for cluster node discovery and for designating one node as the cluster “leader” if needed for organizing (depending on the provider). For testing or single-machine demos, Proto.Actor provides a TestProvider (which essentially fakes cluster membership). In Kubernetes, there’s a provider that uses Kubernetes APIs, etc.

Identity Lookup (Partition): This is the component that maps a given identity to a specific node. Proto.Actor’s default is a partitioning strategy: identities are hashed or otherwise distributed among the cluster members (often using a “partition actor” on each node). When you send a request to user/123, the cluster uses a hash of "user"+"123" to decide, say, that it should live on Node 2, and routes the request there. If the grain isn’t active yet, Node 2 will activate it on first message
GitHub
proto.actor
. Proto.Actor provides an implementation called PartitionIdentityLookup (and others) for this.

Member: A node in the cluster. Each running ActorSystem with cluster enabled is a member (identified by an address and some metadata like host, port, etc.). Members can have statuses (joining, up, leaving, down). The cluster provider monitors these.

Virtual Actor Lifecycle in Proto.Cluster

Let’s walk through the typical lifecycle of a grain (virtual actor) in Proto.Cluster, using a concrete example scenario:

Scenario: We have a cluster with nodes, and a grain kind "user". We want to send a message to ClusterIdentity("user", "123") (we’ll denote this as user/123).

Initially, user/123 does not exist on any node (no actor is running for it yet). But that’s okay – with virtual actors, you don’t explicitly spawn it. You just send a message (or make a request) to it. Here’s what happens on a high level:

Message Send: The client or actor sends a message addressed to user/123. This goes into the cluster subsystem.

Identity Lookup: The cluster determines which node should own user/123. Suppose it decides on Member2 (could be based on hashing, etc.).

Activation: If Member2 doesn’t currently have an actor for user/123 running, the cluster on Member2 will spawn a new actor of kind "user" and give it the identity "123". This is done by using the Props associated with "user" kind. The new actor is started and a PID is assigned to it
proto.actor
proto.actor
. The first message that triggered this will now be delivered to this actor.

Caching PID: The cluster caches the mapping from user/123 -> PID (Member2’s address and the actor’s ID) so that subsequent messages to user/123 can be routed directly to that PID without re-spawning.

Usage: Now the grain is active. Any node in the cluster that wants to send to user/123 will be forwarded to that PID on Member2. The client that sent a request might get a response if it was a ask-pattern request. From the client’s perspective, it just addressed user/123 and got a result, not caring which node handled it.

If Member2 later goes down (crashes or leaves the cluster), what happens to user/123? The cluster notices Member2 is unreachable (via the provider). The cached PID for user/123 is invalidated. The next time someone sends a message to user/123, the cluster will perform an activation again – perhaps this time on a different node (say Member1)
proto.actor
proto.actor
. It does mean the actor’s state was lost when Member2 died (unless you use persistence – see a note on that later), but the system continues to function. This is why they’re called virtual actors – they can come and go, and the “virtual address” (the identity) stays constant.

 

To summarize differences from normal actors:

Grains are referenced by identity, not direct PID. You use ClusterIdentity (kind + identity) to refer to them
GitHub
. The cluster will give you a PID under the hood, but you generally call cluster APIs to send/request.

You don’t manually spawn grains (in most cases). You just send a message or call a grain method, and the system will spawn it if needed.

Grains might be restarted on another node at any time (usually only after failures or if you deliberately stop them). This is transparent – you still use the same identity.

Grains should handle state carefully. Since they can be reactivated, if you need state persistence beyond the life of a single activation, you might use Proto.Actor’s Persistence module to persist state (Module 9 of the bootcamp covers this).

Here’s a simplified sequence diagram of sending a message to a cluster grain for the first time and then after a node failure:

sequenceDiagram
    participant Client
    participant Node1 as Node1 (Cluster Member)
    participant Node2 as Node2 (Cluster Member)
    Note over Node1,Node2: Both nodes are in the cluster
    Client->>Node1: Send request to grain user/123 (kind=user, id=123)
    alt Grain not yet active
        Node1->>Node2: (Cluster decides Node2 should host user/123) Activate grain on Node2
        Node2->>Grain123: Spawn UserActor for user/123
        Grain123-->>Client: [Process message and reply]
    end
    Note over Client: Grain user/123 now lives on Node2
    %% Now simulate Node2 failure
    Note over Node2: Node2 goes down!
    Client->>Node1: Send another request to user/123
    Note over Node1: Node2 is down, grain needs new activation
    Node1->>Node1: Activate grain on Node1 (new host for user/123)
    Node1->>Grain123b: Spawn new UserActor for user/123
    Grain123b-->>Client: [Process message and reply]


In this diagram, at first message, Node1 (perhaps a cluster leadership or routing function) chooses Node2 to host the grain and forwards the request. Node2 spawns Grain123 (UserActor). Later, Node2 fails. When the client sends again, the cluster now spawns Grain123b on Node1. The client is unaware of these changes; it just keeps targeting user/123. This demonstrates the self-healing, location-transparent nature of the cluster
GitHub
GitHub
.

 

Proto.Cluster handles a lot behind the scenes: membership events, a partitioning actor that might live on each node to route grain messages, etc. But as a developer using it, you mostly interact with a friendly API. Let’s see how to set up a cluster and call a grain in code.

Setting Up a Proto.Cluster (C#)

To start a cluster node in C#, you will configure the ActorSystem with cluster settings, similar to how we configured remoting:

Define your grain message contracts and (optionally) generate grain interfaces – often done via Proto.Cluster.CodeGen (which uses Protobuf IDL to generate strongly-typed interfaces for grains). For simplicity, we’ll assume a grain that just responds to a hello request.

Register cluster kinds: For each grain type, create a ClusterKind. For example:

var helloKind = new ClusterKind("hello", Props.FromProducer(() => new HelloActor()));


The string "hello" is the kind name, and the Props defines how to create that actor.

Cluster configuration: Create a ClusterConfig. You must specify a cluster provider and an identity lookup. For demo purposes, Proto.Actor provides an in-memory provider (for tests or single-machine clusters) called TestProvider and a corresponding InMemAgent. We’ll use that to avoid external dependencies:

var clusterProvider = new TestProvider(new TestProviderOptions(), new InMemAgent());  
var identityLookup = new PartitionIdentityLookup();  
var clusterConfig = ClusterConfig.Setup("MyCluster", clusterProvider, identityLookup, helloKind);


Here, "MyCluster" is an arbitrary cluster name (all nodes must use the same name). We included the helloKind so the cluster knows how to spawn those.

Add to ActorSystem and start:

var system = new ActorSystem().WithRemote(GrpcNetRemoteConfig.BindToLocalhost())  
                              .WithCluster(clusterConfig);  
await system.Cluster().StartMemberAsync();


This builds the actor system with both remote and cluster capabilities. We bind to localhost with an automatically chosen port (or you can specify a port with BindTo). Then we call StartMemberAsync(), which joins the cluster (using the provider). If other nodes are running with the same provider, they will discover each other. In our case, if we run two nodes on the same machine with TestProvider, they’ll form a cluster of two members.

Once the cluster is running, we can obtain a reference to a grain and call methods (or send messages). If you used the code generation, you might have a HelloGrainClient that allows calling a typed method. Without codegen, you can use the cluster’s Request mechanism:

 

For instance, suppose HelloActor expects messages of type HelloRequest and responds with HelloResponse. You can send a request to the cluster like:

var cluster = system.Cluster();
var result = await cluster.RequestAsync<HelloResponse>("hello", "user123", new HelloRequest { Name = "Proto" }, CancellationToken.None);
Console.WriteLine(result.Message);  // prints whatever HelloActor responded


Here, we invoked RequestAsync<T>(kind, identity, message, ...). Proto.Cluster will ensure that a grain of kind "hello" with identity "user123" is running somewhere and send the HelloRequest to it, then await the HelloResponse. This is a one-liner to interact with a virtual actor. Alternatively, with codegen, you might do:

var helloGrain = cluster.GetHelloGrain("user123");  
var reply = await helloGrain.SayHello(new HelloRequest { Name = "Proto" });  


Which looks like a normal method call. Under the hood, it does the same thing – uses cluster identity to route to the grain.

 

Go Setup: In Go, the cluster API is similar:

You configure with cluster.Configure(name, provider, lookup, remoteConfig). For example:

provider := consul.New()  // using Consul provider, or use automanaged for local
lookup := disthash.New()  // partition lookup
remoteConfig := remote.Configure("127.0.0.1", 0)  
config := cluster.Configure("MyCluster", provider, lookup, remoteConfig)  
config = config.WithClusterKind("hello", actor.PropsFromProducer(func() actor.Actor {
    return &HelloActor{}  
}))  
clust := cluster.New(actorSystem, config)  
clust.StartMember()  


This joins the cluster using (for example) Consul for membership. In a local demo, you might use the clusterproviders/automanaged provider which doesn’t need external systems – it’s similar to the TestProvider.

To call a grain, if using codegen you’d have a generated client. Without it, you can manually request:

pid := clust.Get("hello", "user123")  // gets a PID for the identity (might spawn if needed)
res, err := clust.Root().RequestFuture(pid, &HelloRequest{Name: "Proto"}, 5*time.Second).Result()
if err == nil {
    fmt.Println(res.(*HelloResponse).Message)
}


The cluster has convenience functions like cluster.Get to get a PID for an identity (though often you won’t need that directly if using typed API).

Cluster Monitoring and Routing

When running a cluster, you often run multiple instances of your application (perhaps on different machines or containers). The cluster provider (like Consul, etcd, or Kubernetes API) helps them discover each other. Once discovered, Proto.Cluster ensures there is an activator on each node responsible for spawning grains when needed. There are also background gossip protocols to share information about what grains are active where, and ping each other for health. While you don’t need to interact with these directly, it’s useful to know that Proto.Cluster is doing a lot to maintain the illusion that any grain can be reached any time.

 

One point to note: grain eviction. By default, Proto.Actor does not garbage-collect grains automatically (other than on node shutdown). If a grain has not received messages for a while and you want to remove it from memory, you can use the ReceiveTimeout within the grain to self-stop on inactivity
GitHub
GitHub
. You could also explicitly stop a grain by sending it a PoisonPill message or similar. But typically, grains are left in memory once activated until either the process stops or you program them to shut down on idle. This is a design decision to avoid the complexity of distributed garbage collection; it’s up to you to decide if an actor should die after being idle.

Example: A Simple Clustered Hello (Go)

Let’s outline a minimal working cluster example in Go (since the .NET example was more configuration heavy, a Go example might be shorter here). We’ll use the AutoManaged provider, which allows a cluster on a single machine without external dependencies (useful for testing cluster logic locally). We’ll simulate two nodes in one process for brevity (though in practice they’d be separate processes).

import (
    "fmt"
    "time"
    "github.com/asynkron/protoactor-go/actor"
    "github.com/asynkron/protoactor-go/cluster"
    "github.com/asynkron/protoactor-go/cluster/clusterproviders/automanaged"
    "github.com/asynkron/protoactor-go/cluster/identitylookup/disthash"
    "github.com/asynkron/protoactor-go/remote"
)

// Define a grain actor
type HelloActor struct{}

func (h *HelloActor) Receive(ctx actor.Context) {
    switch msg := ctx.Message().(type) {
    case *HelloRequest:
        reply := &HelloResponse{Message: "Hello, " + msg.Name + " from " + ctx.Self().Address}
        ctx.Respond(reply)
    }
}

func main() {
    system1 := actor.NewActorSystem()
    system2 := actor.NewActorSystem()

    // Configure cluster for both systems
    provider := automanaged.NewWithLease(func() string { return "127.0.0.1:0" }) // auto-managed membership
    lookup := disthash.New()
    remoteConfig := remote.Configure("127.0.0.1", 0) // auto assign port
    config := cluster.Configure("MyCluster", provider, lookup, remoteConfig).
        WithClusterKind("hello", actor.PropsFromProducer(func() actor.Actor { return &HelloActor{} }))

    cluster1 := cluster.New(system1, config)
    cluster2 := cluster.New(system2, config)
    // Start both cluster members
    cluster1.StartMember()
    cluster2.StartMember()

    // Give clusters a moment to discover each other
    time.Sleep(1 * time.Second)

    // Use cluster1 to request a greeting from cluster2's grain (maybe by hash it'll be on cluster2)
    res, err := cluster1.RequestFuture(cluster.NewClusterIdentity("hello", "user123"), &HelloRequest{Name: "Proto"}, 3*time.Second).Result()
    if err == nil {
        fmt.Println(res.(*HelloResponse).Message)
    }

    cluster1.Shutdown(true)
    cluster2.Shutdown(true)
}


This Go snippet creates two actor systems and clusters in one program (for demonstration). Both join the same cluster name "MyCluster". The AutoManaged provider with lease basically picks random free ports and shares the cluster topology among them automatically. After starting, we perform a cluster request to hello/user123. The cluster will route this to one of the nodes (likely cluster1 or cluster2, depending on hashing). The HelloActor replies with a message that includes ctx.Self().Address, so we can see which node responded. Running this should print a greeting that indicates which node (address) processed it. We then shut down both clusters.

 

In a real deployment, you would run separate processes (each running code similar to cluster1 initialization). They would find each other via the provider (Consul, etc.), and you would send requests from any node to any grain identity.

When to use Proto.Cluster vs Proto.Remote

If you have a dynamic environment (microservices or need to scale out and in, with actors that can be anywhere), Proto.Cluster is very convenient and powerful. If your scenario is simpler (e.g., just two fixed processes that need to talk), Proto.Remote might suffice without the additional complexity of cluster membership. In fact, Proto.Cluster uses Proto.Remote under the hood for the actual messaging.

 

Proto.Cluster’s virtual actors simplify the developer’s mental model: you pretend every user or entity has a persistent actor. The system ensures that is “virtually” true, activating them on demand. This can greatly simplify certain classes of applications like games, IoT systems (sensors as actors), and stateful web services.

 

In the next (final) chapter, we will discuss how to test actor systems built with Proto.Actor. Testing concurrent and distributed code can be challenging, but Proto.Actor provides a TestKit and other tools to make writing tests for actors easier. We’ll look at examples of using Proto.TestKit for unit testing actor behavior.

Chapter 5: Testing Proto.Actor Systems with Proto.TestKit
Testing is a crucial part of developing reliable systems. Actor-based systems introduce concurrency, which can make testing tricky if you try to do it with traditional approaches (like expecting results immediately, or trying to synchronize threads manually). Proto.Actor provides the Proto.TestKit module (for .NET and Go) to assist in writing tests for actors. In this chapter, we’ll cover how to use test kit features such as test probes to capture messages, how to simulate timings, and general strategies for testing actors, both in isolation and as part of a system.

Challenges in Testing Actors

Actors process messages asynchronously, so test code must account for timing (a message sent might not be processed immediately).

Actors encapsulate state and interact via messages, so verifying behavior often means observing either the actor’s state via messages or its interactions (what messages it sends out).

In a multi-actor scenario, the nondeterministic scheduling means tests need to be written to account for messages arriving in varying orders or with some delays.

Proto.TestKit is inspired by Akka’s TestKit, providing tools like TestProbe (an actor that records messages it receives) and utilities to await conditions or intercept actor communications.

Proto.TestKit Overview

Proto.TestKit offers a few key components:

TestProbe: A probe is essentially a dummy actor we create in tests that can receive messages and allows us to assert on them. We can use a probe to:

Send messages to other actors and receive their replies.

Watch what messages an actor sends to others by placing the probe in between or attaching it as a monitor.

Generally, observe actor behavior without modifying the actors under test.

Mailbox/Receive Probes: You can attach a probe to an actor’s Props so that the probe will get a copy of messages sent to or from that actor. For example, Props.WithReceiveProbe(probe) in .NET will forward every message an actor processes to the probe after the actor has processed it
GitHub
GitHub
. Similarly, WithSendProbe(probe) captures messages the actor sends out. In Go, there are testkit.WithMailboxStats or WithReceiveMiddleware to capture messages via middleware. These are advanced, but extremely useful for white-box testing of actor internals (without changing the actor code).

Awaiting and conditions: The test kit provides functions like probe.ExpectNext<T> or probe.GetNextMessage() with timeouts to wait for messages to arrive, and probe.ExpectNoMessage() to assert that nothing arrives within a duration
GitHub
GitHub
. There’s also AwaitCondition to poll for some condition to become true within a time. These help eliminate brittle sleep-based tests; you can wait up to X seconds for an event rather than assuming it happens by X.

Let’s walk through examples in both C# and Go to illustrate typical test scenarios.

Example 1: Testing a Request-Response Actor (Ping-Pong)

Suppose we have a simple actor that replies “pong” when it receives “ping”. We want to test that:

Sending "ping" yields a "pong" response.

The actor doesn’t send any unexpected messages.

C# Test using TestProbe:

using Proto;
using Proto.TestKit;
using Xunit;  // assuming xUnit for demonstration

public class PingActor : IActor
{
    public Task ReceiveAsync(IContext context)
    {
        if (context.Message is string msg && msg == "ping")
            context.Respond("pong");
        return Task.CompletedTask;
    }
}

public class PingActorTests
{
    [Fact]
    public async Task PingActor_ShouldRespondWithPong()
    {
        var system = new ActorSystem();
        // Create a test probe actor
        var (probe, probePid) = system.Root.CreateTestProbe();
        // Spawn the actor under test
        var pingProps = Props.FromProducer(() => new PingActor());
        var pingPid = system.Root.Spawn(pingProps);

        // Use the probe to send a request and capture the response
        probe.Request(pingPid, "ping");
        // Expect a response of type string (this will await until it gets one or timeout)
        var response = await probe.GetNextMessageAsync<string>();
        Assert.Equal("pong", response);

        // Verify no extra messages:
        await probe.ExpectNoMessageAsync(TimeSpan.FromMilliseconds(100));
    }
}


In this test, we used CreateTestProbe() to get a probe and its PID. The probe acts like an actor that we can send messages from and that buffers received messages. We then spawned the PingActor normally. Instead of doing system.Root.RequestAsync (which could have been another way to get a response), we demonstrated using the probe:

probe.Request(pingPid, "ping") sends the "ping" message to pingPid, but it does so in a way that sets the sender of the message as the probe itself. In Proto.TestKit, probe.Request is essentially calling Context.Request from within the probe’s context
GitHub
GitHub
. This means when PingActor does Respond("pong"), Proto.Actor will deliver the "pong" to the sender (which is the probe).

Then probe.GetNextMessageAsync<string>() waits for the probe’s actor to receive a message of type string. It returns that message, which we assert is "pong". If no message arrives in the default timeout (usually 1 second), the test fails. If a wrong type or content arrives, we can detect that too.

We call ExpectNoMessageAsync with 100ms to ensure nothing else was sent to the probe after the "pong". This is a quick check to catch any unexpected extra messages.

Go Test using TestProbe:

 

In Go, suppose we use the built-in testing package. The protoactor-go/testkit provides similar probe functionality:

import (
    "testing"
    "time"
    "github.com/asynkron/protoactor-go/actor"
    "github.com/asynkron/protoactor-go/testkit"
    "github.com/stretchr/testify/require"
)

type PingActor struct{}

func (p *PingActor) Receive(ctx actor.Context) {
    if msg, ok := ctx.Message().(string); ok && msg == "ping" {
        ctx.Respond("pong")
    }
}

func TestPingActorResponds(t *testing.T) {
    system := actor.NewActorSystem()
    // Create a new TestProbe actor
    probe := testkit.NewTestProbe()
    probePID := system.Root.Spawn(actor.PropsFromProducer(func() actor.Actor { return probe }))

    // Spawn the actor under test
    pingPID := system.Root.Spawn(actor.PropsFromProducer(func() actor.Actor { return &PingActor{} }))

    // Use probe to send request
    probe.Request(pingPID, "ping")
    // Get the next message of type string that the probe receives
    reply, err := testkit.GetNextMessageOf[string](probe, 1*time.Second)
    require.NoError(t, err)
    require.Equal(t, "pong", reply)

    // Ensure no further messages
    require.NoError(t, probe.ExpectNoMessage(50 * time.Millisecond))
}


In the Go test, we:

Created a TestProbe using NewTestProbe(). In protoactor-go, a TestProbe itself implements actor.Actor. We spawned it like a normal actor to get a PID (probePID). The probe actor will record messages it receives.

We spawned the PingActor under test, got its PID.

We used probe.Request(pingPID, "ping"). The Go TestProbe has a Request method that sends a message with the probe as sender (similar to .NET).

We then used testkit.GetNextMessageOf[string](probe, 1*time.Second) to retrieve the next message of type string from the probe’s inbox. This returns the message ("pong") or an error if timeout. We assert that we got "pong".

probe.ExpectNoMessage(50 * time.Millisecond) checks that nothing else arrived at the probe in that short duration after.

If the actor didn’t respond or responded with the wrong content, these tests would catch it (either by timing out or failing the equality check).

Example 2: Observing Actor Internal Messages with Probes

For more complex actors, you might want to ensure that when they receive a certain message, they send out some other message to another actor. You can test this by using probe as the recipient of that outgoing message. One way is to have the actor under test accept a PID to send responses to (so you pass the probe’s PID), or you use the Props.WithSendProbe or WithReceiveProbe feature.

 

C# Example – Attaching a probe to observe outgoing messages:

 

Suppose we have an actor that upon receiving a StartJob message, sends a JobStarted message to some “monitor” actor (could be a PID it has). We want to test that it indeed sends JobStarted. If we don’t want to modify the actor to inject a test PID, we can intercept at the Props level:

var system = new ActorSystem();
var (probe, _) = system.CreateTestProbe();

// Create Props for actor under test, with a probe to observe its outgoing messages.
var props = Props.FromProducer(() => new JobActor())
    .WithSendProbe(probe);   // this will forward any message sent by JobActor to the probe

var jobActorPid = system.Root.Spawn(props);
system.Root.Send(jobActorPid, new StartJob("abc123"));

// Now expect that the actor sent out a JobStarted message:
var startedMsg = await probe.GetNextMessageAsync<JobStarted>();
Assert.Equal("abc123", startedMsg.JobId);


What happens here is WithSendProbe(probe) wraps the actor’s context such that whenever the actor calls context.Send or context.Respond, the message is relayed to the probe (in addition to being delivered to its actual target)
GitHub
GitHub
. This allows the test to capture outgoing communications passively. In our test, we don’t even need to know who the actual target was; if a JobStarted was sent anywhere, our probe got a copy. We then assert on it.

 

Proto.TestKit also has TestMailboxStats (in .NET) and similar in Go, which can hook into the actor’s mailbox to count messages or detect if a message was received. For example, WithMailboxProbe(probe) in .NET uses a ProbeMailboxStatistics under the hood to send every mailbox-received message to the probe
GitHub
GitHub
. This can be used to verify order of messages in mailbox or detect if certain messages were enqueued.

 

In Go, to achieve similar things, you can use testkit.NewTestMailboxStats(predicate) which returns a mailbox stats that can signal when a certain message passes through the mailbox
GitHub
GitHub
. For example, to wait until a "done" message is processed, as shown in the Proto.Actor Go testkit examples
GitHub
GitHub
.

Example 3: Timing and Scheduler Testing

If your actor uses timers (e.g., ReceiveTimeout or schedules messages to itself), testing timing-dependent behavior could be flaky if you rely on real time. Proto.Actor provides a hook ISchedulerHook in .NET which you can implement to intercept scheduled events, allowing your test to simulate time progression deterministically
GitHub
GitHub
. In practice, you might not need this unless you have complex timing logic. A simpler approach in tests is often to shorten timeouts (e.g., set a small ReceiveTimeout in the actor for test) and then use ExpectNextMessage within that span.

Best Practices for Testing Proto.Actor:

Use Probes to avoid sleeps: Instead of doing Thread.Sleep or time.Sleep and then checking if something happened, use the probe’s GetNextMessage or AwaitCondition to wait until the expected event occurs or a timeout passes. This makes tests more deterministic and faster (they don’t always wait the full timeout if the message comes earlier).

Isolate actor logic: For unit testing an actor, treat it as a black box – send it messages, and observe responses or outgoing messages. If the actor modifies some external state (like a database), consider abstracting that behind an interface so you can inject a fake implementation for testing that records what happens.

Use TestKit for integration tests: You can spin up a mini actor system in a test, spawn multiple actors (some could be test probes) and simulate interactions. For example, test a supervisor strategy by making an actor throw an exception (maybe by sending it a special message that causes error) and verifying the supervisor restarted it (maybe the actor has a counter state that resets on restart – you can check that). Proto.TestKit doesn’t directly assert “actor restarted,” but you infer it from behavior.

Cluster testing: You can run multiple cluster members in a test (like the Go example above) to simulate distributed scenarios. The TestProvider or AutoManaged provider is useful here. There is also mention of Cluster Testing in Proto.Actor documentation (they provide hooks to simulate network partitions or member changes). If you need to test how your code handles node failures, you might use those hooks or simply start and stop cluster members in the test and see how the remaining system responds
proto.actor
.

A brief note on Proto.TestKit in Go

The Go testkit is slightly less full-featured than the .NET one (since Go doesn’t have async/await, the patterns differ). But as we saw, the fundamentals are there: TestProbe actor with Request and ExpectNoMessage, and utility for GetNextMessageOf[T]. The Go testkit also has NewTestMailboxStats which can be used as a mailbox middleware to capture mailbox events, similar to .NET’s TestMailboxStats
GitHub
GitHub
.

Summary

Testing actor-based systems can be made systematic with these tools: TestProbe to simulate actors and capture communications, and scheduling hooks to control timing. By using Proto.TestKit, you can write tests that:

Send messages to an actor and assert on the replies (using probe or future/promise style).

Verify internal messaging: that an actor sent a specific message (to another actor or to itself) as a result of something.

Simulate sequences of events and ensure the actor ends up in the expected state (state verification might mean the actor sends some state out or you query it via a message).

With Proto.Actor, since everything is message-driven, most tests boil down to “given this input message (and maybe some preceding messages), the actor should send/output this other message or produce that effect.” The testkit helps capture those outputs for verification.

 

This concludes the Proto.Actor Bootcamp. We started from the foundational concepts of the actor model, explored Proto.Actor’s core API for building actors in C# and Go, then extended to remote communication and cluster-based virtual actors, and finally saw how to test actor systems effectively. With these tutorials, you should be able to create your own concurrent, distributed applications using Proto.Actor, step by step: first get comfortable with actors and messages, then scale out with remoting or clustering, and always validate your actor behavior with thorough tests. Happy acting!
