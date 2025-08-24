# Chapter 3: Configuring Proto.Remote

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

[Back to Chapter 3](../)

To use remoting, each process (actor system) needs to open a port and start a remote server. In C#, this is done by creating a `GrpcNetRemoteConfig` and adding it to the `ActorSystem`; in Go, by configuring `remote.Configure`. Typically, you will:

Register message types: Proto.Actor needs to know how to serialize your message classes. In C#, you call `config = GrpcNetRemoteConfig.BindTo(host, port).WithProtoMessages(Descriptor)`, passing in the Protobuf descriptor for your messages. In Go, you’d include `remote.WithProtoFiles` or ensure your Protobuf-generated Go types are registered. For simplicity, if you’re only sending simple string or int messages, you might use built-in serialization, but Protobuf is recommended for compatibility.

Register actor kinds (for remote spawn): If you want to allow other nodes to spawn certain types of actors on this node, register them by name. In C#: `.WithRemoteKind("echo", Props.FromProducer(() => new EchoActor()))` adds an actor kind named `echo` with its creation logic. In Go, there’s `remote.Register("echo", actor.PropsFromProducer(...))` typically.

Start the remote: In C#, either call `remote.Start()` if using the older API (Remote class), or if using the new `ActorSystem` configuration API, you’d do `system.Root.SpawnNamedAsync` for remote spawn or simply rely on cluster (which auto-starts remote). In Go, call `remoter := remote.NewRemote(system, config); remoter.Start()`.

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

