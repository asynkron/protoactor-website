# Remote Spawn

Remote Spawning means the act of `Spawn`-ing an actor on another host/member in a distributed setting.

In Proto.Actor you can do this using both the Proto.Remote, and the Proto.Cluster modules.
The way to do it are basically the same, with some small differences.

To register what kinds of actors can be spawned remote or in a cluster, you register the actor types, or "kinds" as they are called here to not conflate with other terminology.

This is done on either the on the C#-`RemoteConfig` / Go-`remote.Config` object using `WithRemoteKind(name,props)`.

Or, on the C#-`ClusterConfig`/ Go-`cluster.Config` objects using `WithClusterKind(name, props)`.

This is essentially a dictionary mapping from string, the Kind, to a `Props` which tells the remote and cluster modules how to configure and spawn an actor of that "kind".

### Remote Spawn using Proto.Remote

{{< tabs >}}
{{< tab "C#" >}}
```csharp
var config = GrpcCoreRemoteConfig
    .BindTo(advertisedHost, 12000)
    .WithProtoMessages(MyMessagesReflection.Descriptor)
    .WithRemoteKind("echo", Props.FromProducer(() => new EchoActor()));
```
{{</ tab >}}
{{< tab "Go" >}}
```csharp
var config = remote.Configure(advertisedHost, 12000)
    .WithRemoteKind("echo", actor.FromProducer(someProducer));
```
{{</ tab >}}
{{</ tabs >}}

### Remote Spawn using Proto.Cluster

{{< tabs >}}
{{< tab "C#" >}}
```csharp
var config = ClusterConfig.Setup(....)
    .WithClusterKind("echo", Props.FromProducer(() => new EchoActor()));
```
{{</ tab >}}
{{< tab "Go" >}}
```csharp
var config = cluster.Configure(...)
    .WithClusterKind("echo", actor.FromProducer(someProducer));
```
{{</ tab >}}
{{</ tabs >}}

### Why the separation of the two?

If Proto.Remote and Proto.Cluster configure remote spawning the same way, why separate the two?

Conceptually, they work the same, but from an implementation point of view they do not.
Cluster actors have different lifecycles, different hosting and different internal plugins and messages.
For this reason we chose to keep them separate, yet similar from an API perspective.

A completely valid scenario might be that you want to spawn an actor on a very specific node, and it should work just like any other actor, then you can do this using Proto.Remote.

While if you in the same application, also want to leverage virtual actors, with the rich set of features they provide, you would do this using Proto.Cluster.
