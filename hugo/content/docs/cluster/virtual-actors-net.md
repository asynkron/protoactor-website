---
layout: docs.hbs
title: Virtual Actors (.NET)
---

# Virtual Actors (.NET)

What are virtual actors?

“we recommend using codegen package, but you can code them on your own”

## Generatinc virtual actors code


As of Release 0.17.0 of Proto.Cluster for .NET, you can reference the Nuget package `ProtoGrainGenerator`, and this will automatically generate the code for you.
The code is generated under the `/obj` folder and hidden from the user, but included for compilation upon build.

install nuget package (already in the cluster setup? or should we de the setup here?)


```
dotnet add package Proto.Cluster
dotnet add package Proto.Cluster.CodeGen
```

Add proto file `MyVirtualActors.proto`:

```proto
syntax = "proto3";
package shared;
option csharp_namespace = "MyPoject";

// todo: add messages or sth

service VehicleActor {
  rpc OnPosition (Position) returns (google.protobuf.Empty);
  rpc GetPositionsHistory(GetPositionsHistoryRequest) returns (PositionBatch);
}
```

Consigure it in project file, e.g. `MyPoject.csproj`:


```xml
<ItemGroup>
    <ProtoGrain Include="MyVirtualActors.proto" AdditionalImportDirs="." />
</ItemGroup>
```

`ProtoGrain` is a special MS Build task that...

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

## Running a cluster

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