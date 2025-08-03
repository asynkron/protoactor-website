---
layout: docs.hbs
title: Working with a cluster (.NET)
---

# Working with a cluster (.NET)


## Configuring a cluster

To use a cluster, we need to configure it first in the `ActorSystem`.

That is what a basic configuration looks like:

```csharp
using Proto;
using Proto.Cluster;
using Proto.Remote;

var actorSystemConfig = ActorSystemConfig.Setup();

var remoteConfig = GrpcNetRemoteConfig.BindTo(/* ... */);

var clusterConfig = ClusterConfig.Setup(
    clusterName: "MyCluster",
    clusterProvider: new TestProvider(new TestProviderOptions(), new InMemAgent()),
    identityLookup: new PartitionIdentityLookup()
);

var actorSystem = new ActorSystem(actorSystemConfig)
    .WithRemote(remoteConfig)
    .WithCluster(clusterConfig);
```

To learn more about **Actor System** configuration, read the [Actors](../actors.md) section of Proto.Actor's documentation.

**Remote** _must be configured_ when using a cluster. To learn more about its configuration, read the [Remote](../remote.md) section of Proto.Actor's documentation.

`Setup` parameters:

1. `clusterName` - a name of the cluster; it should be the same in all cluster members you want to work together.

1. `clusterProvider` - provides information about currently available members in a cluster; read more about it in [the Cluster Providers section](cluster-providers-net.md).

1. `identityLookup` - allows a cluster to locate grains (virtual actors); read more about it in [the Identity Lookup section](identity-lookup-net.md).


## Registering grains (virtual actors)

Grains are not explicitly spawned. Instead, they are spawned (activated) by a cluster (in one of the cluster members), when a first message is sent to them. In order for a cluster member to know how to spawn a grain of a given _kind_, we need to register it in a `ClusterConfig`:

```csharp
var clusterConfig = ClusterConfig
    .Setup(/* ... */);
    .WithClusterKind(
        kind: "user",
        prop: Props.FromProducer(() => new UserGrainActor())
    );
```

`WithClusterKind` parameters:

1. `kind` - a type of grain.

1. `prop` - define how an actor and its context is created. You can read more about Props [here](../props.md).

You can create any kind of actor using Props. However, implementing grains by hand comes with a lot of gotchas, e.g. you have to make sure that grain _always_ responds to certain kinds of messages (also, with the correct response message type). For this reason, the recommended way of creating grains is by using the `Proto.Cluster.CodeGen` package, which solves most of these problems. Read more about it [here](codegen-net.md).


## Getting a Cluster object

To work with a cluster, we need a `Cluster` object.

You can get it from an `ActorSystem`:

```csharp
using Proto;
using Proto.Cluster;

Cluster cluster = actorSystem.Cluster();
```

Or from `IContext`:

```csharp
using Proto;
using Proto.Cluster;

Cluster cluster = context.Cluster();
```


## Starting and shutting down a cluster member

Cluster members need to be explicitly started and shut down.

To start a new cluster member:

```csharp
await _actorSystem
    .Cluster()
    .StartMemberAsync();
```

If you only want to send messages to a cluster, you can start it as a client:

```csharp
await _actorSystem
    .Cluster()
    .StartClientAsync();
```

To shut down a cluster:

```csharp
await _actorSystem
    .Cluster()
    .ShutdownAsync();
```


## Sending messages to grains (virtual actors)

Grains require request-response-based messaging to ensure that the message was delivered and/or that the grain was properly activated. This allows Proto.Actor to re-try getting the PID by calling the actor until it succeeds.

You do this using:

```csharp
using Proto.Cluster;

BlockUserResponse response = await cluster.RequestAsync<BlockUserResponse>(
    identity: "150",
    kind: "user",
    message: new BlockUser(),
    ct: cancellationToken
);
```

The result will be one of the following:

1. `null` - when a request timeouts.
1. A grain's response message.

As mentioned before, the recommended way of creating grains is by using the `Proto.Cluster.CodeGen` package. A generated grain will include `Cluster` extension methods for sending requests to it:

```csharp
BlockUserResponse response = await cluster
    .Cluster()
    .GetUserGrain("150")
    .BlockUser(ct: cancellationToken);
```

Read more about generating grains [here](codegen-net.md).


### Handling timeouts

Timeouts are handled with cancellation tokens. Proto.Actor has a `CancellationTokens` utility that efficiently creates such tokens:

```csharp
using Proto;
using Proto.Cluster;

BlockUserResponse response = await cluster.RequestAsync<BlockUserResponse>(
    identity: "150",
    kind: "user",
    message: new BlockUser(),
    ct: CancellationTokens.WithTimeout(TimeSpan.FromSeconds(2))
);
```


## Using a cluster in an ASP.NET Core app

It's recommended to configure and register an `ActorSystem` in a service collection as a singleton:

```csharp
services.AddSingleton(provider =>
{
    var actorSystemConfig = ActorSystemConfig.Setup();

    var remoteConfig = GrpcNetRemoteConfig.BindTo(/* ... */);
    
    var clusterConfig = ClusterConfig.Setup(/* ... */);

    return new ActorSystem(actorSystemConfig)
        .WithServiceProvider(provider)
        .WithRemote(remoteConfig)
        .WithCluster(clusterConfig);
});
```

For convenience, you can also register a `Cluster` object:

```csharp
services.AddSingleton(provider => provider
    .GetRequiredService<ActorSystem>()
    .Cluster()
);
```

The recommended way of starting and shutting down a cluster member in an ASP.NET Core app is by using a [Hosted Service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-6.0&tabs=visual-studio).

To create a hosted service:

```csharp
public class ActorSystemClusterHostedService : IHostedService
{
    private readonly ActorSystem _actorSystem;

    public ActorSystemClusterHostedService(ActorSystem actorSystem)
    {
        _actorSystem = actorSystem;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _actorSystem
            .Cluster()
            .StartMemberAsync(); // or StartClientAsync()
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        await _actorSystem
            .Cluster()
            .ShutdownAsync();
    }
}
```

To register it:

```csharp
services.AddHostedService<ActorSystemClusterHostedService>();
```