---
layout: docs.hbs
title: Virtual Actors (.NET)
---

# Getting started with Proto.Cluster (.NET)


This page will show you how to create a simple one-node cluster with a single virtual actor.


## Requirements

Create a .NET ASP.NET Core Web Application named `ProtoClusterTutorial`. For simplicity, this tutorial will use a Minimal API, however porting it to a classical ASP.NET Core Web App should be straightforward.

You'll need the following NuGet packages:
* `Proto.Actor`
* `Proto.Remote`
* `Proto.Remote.GrpcCore`
* `Proto.Cluster`
* `Proto.Cluster.CodeGen`
* `Proto.Cluster.TestProvider`
* `Grpc.Tools` - for compiling Protobuf messages


## Creating a virtual actor

The recommended way of creating a virtual actor is by using a `Proto.Cluster.CodeGen` package.

Add proto file `VehicleActor.proto`:

```proto
syntax = "proto3";
package shared;
option csharp_namespace = "MyPoject";

service VehicleActor {
  rpc OnPosition (Position) returns (google.protobuf.Empty);
  rpc GetPositionsHistory(GetPositionsHistoryRequest) returns (PositionBatch);
}
```

todo: add messages

In order for our actor to be compiled, we need to consigure it in a project file, e.g. `MyPoject.csproj`:

```xml
<ItemGroup>
    <ProtoGrain Include="VehicleActor.proto" AdditionalImportDirs="." />
</ItemGroup>
```

todo: do we need additional import dirs?

`ProtoGrain` is a special MS Build task that will compile your `.proto` into a base class for your virtual actor (in this case `VehicleActorBase`). You can find generated code in the `\obj` directory of your project.

Now we can implement an actor by implementing a generated base class:

```csharp
public class VehicleActor : VehicleActorBase
{
    private long _lastPositionUpdateTimestamp = 0;

    public VehicleActor(IContext context) : base(context)
    {
    }

    public override Task OnPosition(Position position)
    {
        // ...

        return Task.CompletedTask;
    }

    public override Task<PositionBatch> GetPositionsHistory(GetPositionsHistoryRequest request)
    {
        // ...

        return Task.FromResult(result);
    }
}
```

todo: add a page for codegen? we could describe things like lifecycle (startup), child actors, msbuild task parameters etc.
You can read more about CodeGen [here](todo).

## Configuring a cluster



Setup cluster in `Startup`:

```csharp
system
    .WithServiceProvider(provider)
    .WithRemote(remoteConfig)
    .WithCluster(ClusterConfig
        .Setup(clusterName, clusterProvider, new PartitionIdentityLookup())
        .WithClusterKind("VehicleActor", vehicleProps)
    )
    .Cluster()
    .WithPidCacheInvalidation();
```


Create a hosted service for starting a cluster:

```csharp
public class ActorSystemHostedService : IHostedService
{
    private readonly ActorSystem _actorSystem;

    public ActorSystemHostedService(ActorSystem actorSystem)
    {
        _actorSystem = actorSystem;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _actorSystem
            .Cluster()
            .StartMemberAsync();
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        await _actorSystem
            .Cluster()
            .ShutdownAsync();
    }
}
```

In services:

```csharp
services.AddHostedService<ActorSystemHostedService>();
```

To consider:
* Maybe we should do it in a console app so it's easier? And then have a separate page for "running in a web app"?


todo: dependency injection
