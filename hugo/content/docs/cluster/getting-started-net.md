---
layout: docs.hbs
title: Virtual Actors (.NET)
---

# Getting started with Proto.Cluster (.NET)


In this tutorial we will:

1. Create a simple, one-node Proto.Actor cluster.
1. Implement two kinds of grains.
1. Send messages to and between these grains.
1. Host everything in a simple ASP.NET Core app.


## Setting up the project

### Required packages

Create an ASP.NET Core Web Application named `ProtoClusterTutorial`. For simplicity, this tutorial will use a Minimal API.

We'll need the following NuGet packages:
* `Proto.Actor`
* `Proto.Remote`
* `Proto.Remote.GrpcCore`
* `Proto.Cluster`
* `Proto.Cluster.CodeGen`
* `Proto.Cluster.TestProvider`
* `Grpc.Tools` - for compiling Protobuf messages

This tutorial was prepared using:
* .NET 6
* Proto.Actor 0.26.0 (all `Proto.*` packages share the same version number)
* `Grpc.Tools` 2.43.0

### Base web app

Let's establish what our base web app code should look like:

`Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/", () => Task.FromResult("Hello, Proto.Cluster!"));

app.Run();
```

Try running your app to see if everything works so far.


### Basic Proto.Cluster infrastructure and configuration

First, we'll get the basic infrastructure of the cluster going.

We need to create, configure and register an `ActorSystem` instance. To keep it clean, we will create an `IServiceCollection` extension in another file to do that:

`ActorSystemConfiguration.cs`:

```csharp
using Proto;
using Proto.Cluster;
using Proto.Cluster.Partition;
using Proto.Cluster.Testing;
using Proto.DependencyInjection;
using Proto.Remote;
using Proto.Remote.GrpcCore;

namespace ProtoClusterTutorial;

public static class ActorSystemConfiguration
{
    public static void AddActorSystem(this IServiceCollection serviceCollection)
    {
        builder.Services.AddSingleton(provider =>
        {
            // actor system configuration

            var actorSystemConfig = ActorSystemConfig
                .Setup();
            
            // remote configuration
            
            var remoteConfig = GrpcCoreRemoteConfig
                .BindToLocalhost();
            
            // cluster configuration

            var clusterConfig = ClusterConfig
                .Setup(
                    clusterName: "ProtoClusterTutorial",
                    clusterProvider: new TestProvider(new TestProviderOptions(), new InMemAgent()),
                    identityLookup: new PartitionIdentityLookup()
                );
            
            // create the actor system

            return new ActorSystem(actorSystemConfig)
                .WithServiceProvider(provider)
                .WithRemote(remoteConfig)
                .WithCluster(clusterConfig);
        });
    }
}
```

Now we can register it in our web app:

`Program.cs`:

```csharp
builder.Services.AddActorSystem();
```

Let's go through each configuration section one by one:

**Actor System configuration**

This is a standard Proto.Actor configuration. It's out of the scope for this tutorial; if you want to learn more, you should check out the [Actors](../actors.md) section of Proto.Actor's documentation.

**Remote configuration**

Proto.Cluster uses Proto.Remote for transport, usually GRPC (Proto.Remote.GrpcCore). Again, its configuration is out of scope for this tutorial; if you want to learn more, you should check out the [Remote](../remote.md) section of Proto.Actor's documentation.

**Cluster configuration**

This is where we configure Proto.Cluster. Let's explain its parameters:
1. `clusterName` - any name will do.
1. `clusterProvider` - a Cluster Provider is an abstraction that provides information about currently available members (nodes) in a cluster. Since right now our cluster only has one member, it's ok to use `TestProvider`. In the future, we will switch to other implementations, like [Consul Provider](consul-net.md) or [Kubernetes Provider](kubernetes-provider-net.md). You can read more about Cluster Providers [here](cluster-providers-net.md).
1. `identityLookup` - an Identity Lookup is an abstraction that allows a cluster to locate grains. `PartitionIdentityLookup` is generally a good choice for most cases. You can read more about Identity Lookup [here](identity-lookup-net.md).


### Cluster object

Most of the time we'll want to interact with the cluster, we will use a `Cluster` object. You can get it from an `ActorSystem` instance:

```csharp
using Proto;
using Proto.Cluster;

// ...

Cluster cluster = actorSystem.Cluster();
```

<!-- todo: link Cluster object documentation when available -->


### Starting a cluster member

Cluster members need to be explicitly started and shut down. You can do it in the following way:

```csharp
await _actorSystem
    .Cluster()
    .StartMemberAsync();

await _actorSystem
    .Cluster()
    .ShutdownAsync();
```

Since we're creating a web app, it's best if we start our cluster using a [hosted service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-6.0&tabs=visual-studio):

`ActorSystemClusterHostedService.cs`:
```csharp
using Proto;
using Proto.Cluster;

namespace ProtoClusterTutorial;

public class ActorSystemClusterHostedService : IHostedService
{
    private readonly ActorSystem _actorSystem;

    public ActorSystemClusterHostedService(ActorSystem actorSystem)
    {
        _actorSystem = actorSystem;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("Starting a cluster member");
        
        await _actorSystem
            .Cluster()
            .StartMemberAsync();
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("Shutting down a cluster member");
        
        await _actorSystem
            .Cluster()
            .ShutdownAsync();
    }
}
```

Register the hosted service in our web app:

`Program.cs`:

```csharp
builder.Services.AddHostedService<ActorSystemClusterHostedService>();
```

At this point, our cluster is not doing much, but it won't hurt to run it and check if nothing breaks. You should see a `Starting a cluster member` line in your app's console.


## Creating a grain

### Modeling a light bulb

Now that we're done with the basic configuration, it's time to implement some features.

In this tutorial, we'll use grains to model smart light bulbs. Their functionality will be as follows:

1. A smart bulb has a state, which is either: "unknown", "on" or "off".
1. Initially, smart bulb's state is "unknown".
1. We can turn a smart bulb on or off, which will write a message to a console.
1. Turning a smart bulb on when it's already on or turning it off when it's already off will not do anything.


### Virtual Actors / Grains

To avoid confusion, in this tutorial we'll refer to virtual actors as grains.

To recap:
1. Grains are essentially actors, meaning they will process messages one at a time.
1. Grains are not explicitly crated (activated). Instead, they are created when they receive the first message.
1. Each grain lives in _one_ of the cluster members.
1. Grain's location is transparent, meaning we don't need to know in which cluster member grain lives to call it.
1. Communication with grains should almost always be a request/response. <!-- todo: explain why? -->
1. Grains are identified by a _kind_ and _identity_, e.g. `airport`/`AMS` or `user`/`53`. It's important to distinguish kind/identity pair with an actor's ID, which in the case of grains might change between activations.


### Generating a grain

<!-- todo: link grains documentation page when it's created -->

The recommended way of creating a grain is by using a `Proto.Cluster.CodeGen` package, which generates most of the grain's code for use from a `.proto` file.

You can create it manually without that package, but:

1. It requires much more boilerplate code.
1. It's easy to make a mistake, e.g. respond to a message with a wrong type of message or not respond at all.

Let's create two `.proto` files: one for grains, and the other for messages used by these grains:

<!-- todo: more info on grain generation? -->

`Grains.proto`:

```proto
syntax = "proto3";

option csharp_namespace = "ProtoClusterTutorial";

import "google/protobuf/empty.proto";

service SmartBulbGrain {
  rpc TurnOn (google.protobuf.Empty) returns (google.protobuf.Empty);
  rpc TurnOff (google.protobuf.Empty) returns (google.protobuf.Empty);
}
```

In order for code generation to work (for both grains and messages), we need to handle them properly in the project file:

`ProtoClusterTutorial.csproj`

```xml
<ItemGroup>
    <ProtoGrain Include="Grains.proto" />
</ItemGroup>
```

`ProtoGrain` is an MSBuild task provided by `Proto.Cluster.CodeGen`.

This is a good moment to build a project and see if code generation doesn't produce any errors.

### Implementing a grain

If everything works correctly, we should implement our grain. `Proto.Cluster.Codegen` only created an abstract base class for our grain, so we need to implement it:

`SmartBulbGrain.cs`:

```csharp
using Proto;
using Proto.Cluster;

namespace ProtoClusterTutorial;

public class SmartBulbGrain : SmartBulbGrainBase
{
    private readonly ClusterIdentity _clusterIdentity;
    
    private enum SmartBulbState { Unknown, On, Off }
    private SmartBulbState _state = SmartBulbState.Unknown;
    
    public SmartBulbGrain(IContext context, ClusterIdentity clusterIdentity) : base(context)
    {
        _clusterIdentity = clusterIdentity;

        Console.WriteLine($"{_clusterIdentity.Identity}: created");
    }

    public override async Task TurnOn()
    {
        if (_state != SmartBulbState.On)
        {
            Console.WriteLine($"{_clusterIdentity.Identity}: turning smart bulb on");
            
            _state = SmartBulbState.On;
        }
    }

    public override async Task TurnOff()
    {
        if (_state != SmartBulbState.Off)
        {
            Console.WriteLine($"{_clusterIdentity.Identity}: turning smart bulb off");
            
            _state = SmartBulbState.Off;
        }
    }
}
```

<!-- todo: explain context and cluster identity -->


### Registering a grain

Remember, that grains are not explicitly activated, but only when they receive the first message. In other words, Proto.Cluster needs to know how to create new instances of your grains. More specifically, they need  be registered when configuring Cluster with a `WithClusterKind` method. 

`ActorSystemConfiguration.cs`:

```csharp
var clusterConfig = ClusterConfig
    .Setup(
        clusterName: "ProtoClusterTutorial",
        clusterProvider: new TestProvider(new TestProviderOptions(), new InMemAgent()),
        identityLookup: new PartitionIdentityLookup()
    )
    .WithClusterKind(
        kind: SmartBulbGrainActor.Kind,
        prop: Props.FromProducer(() =>
            new SmartBulbGrainActor(
                (context, clusterIdentity) => new SmartBulbGrain(context, clusterIdentity)
            )
        )
    );
```

As with actors, we need to provide a `Props` describing how our grain is created.

`SmartBulbGrainActor` is another class generated by `Proto.Cluster.Codegen`, which is a wrapper for our grain code.

<!-- todo: more explanation? -->


## Communicating with grains


### Grain client

We can communicate with grains using a `Cluster` object:


```csharp
private readonly ActorSystem _actorSystem;

public async Task TurnTheLightOnInTheKitchen(CancellationToken ct)
{
    SmartBulbGrainClient smartBulbGrainClient = _actorSystem
        .Cluster()
        .GetSmartBulbGrain(identity: "kitchen");

    await smartBulbGrainClient.TurnOn(ct);
}
```

Both `GetSmartBulbGrain` extention method and `SmartBulbGrainClient` class were generated by `Proto.Cluster.Codegen`.

Mind, that `smartBulbGrainClient` is a client for a _specific_ grain, in this case, a smart bulb that's located in the kitchen.


### Smart bulb simulator

To see how grains behave in our system, we'll create a simulator that will send random messages to random smart bulbs.

We'll do that by creating another hosted service:

```csharp
using Proto;
using Proto.Cluster;

namespace ProtoClusterTutorial;

public class SmartBulbSimulator : BackgroundService
{
    private readonly ActorSystem _actorSystem;

    public SmartBulbSimulator(ActorSystem actorSystem)
    {
        _actorSystem = actorSystem;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var random = new Random();

        var lightBulbs = new[] { "living_room_1", "living_room_2", "bedroom", "kitchen" };

        while (!stoppingToken.IsCancellationRequested)
        {
            var randomIdentity = lightBulbs[random.Next(lightBulbs.Length)];

            var smartBulbGrainClient = _actorSystem
                .Cluster()
                .GetSmartBulbGrain(randomIdentity);

            if (random.Next(2) > 0)
            {
                await smartBulbGrainClient.TurnOn(stoppingToken);
            }
            else
            {
                await smartBulbGrainClient.TurnOff(stoppingToken);
            }

            await Task.Delay(TimeSpan.FromMilliseconds(500), stoppingToken);
        }
    }
}
```

Register the simulator in `Program.cs`:

```csharp
builder.Services.AddHostedService<SmartBulbSimulator>();
```

When you ran the app, you should see console output similar to:

```txt
Starting a cluster member
smart bulb simulator: turning on smart bulb 'living_room_1'
living_room_1: created
living_room_1: turning smart bulb on
smart bulb simulator: turning on smart bulb 'bedroom'
bedroom: created
bedroom: turning smart bulb on
smart bulb simulator: turning on smart bulb 'living_room_2'
living_room_2: created
living_room_2: turning smart bulb on
smart bulb simulator: turning off smart bulb 'bedroom'
bedroom: turning smart bulb off
smart bulb simulator: turning on smart bulb 'living_room_2'
```

As you can see in the first few lines, a `living_room_1` grain is created only after a first message is sent to it.


## Using custom messages

Right now communication with our grain is quite simple: both `TurnOn` and `TurnOff` methods accept and return a predefined `google.protobuf.Empty` message. In this section, we will try to receive a custom message from a grain.

### Creating a custom message

Let's say we want to get a smart bulb's state. For simplicity, let's create a `GetSmartBulbStateResponse` that only contains a smart bulb's state:

`Messages.proto`:

```proto
syntax = "proto3";

option csharp_namespace = "ProtoClusterTutorial";

message GetSmartBulbStateResponse {
  string state = 1;
}
```

In a project file:

`ProtoClusterTutorial.csproj`

```xml
<ItemGroup>
    <Protobuf Include="Messages.proto" />
</ItemGroup>
```

### Importing a custom message

<!-- todo: either use "grain definition file" earlier of think of sth else -->

To use this message in a grain, we need to do three things:
1. Let `Proto.Cluster.CodeGen` know where to look for messages.
1. Import these messages in a `Grains.proto` file.
1. Register that message in `Proto.Remote`.


ad 1) We need to configure the `ProtoGrain` MSBuild task by adding `AdditionalImportDirs` attribute:

`ProtoClusterTutorial.csproj`

```xml
<ItemGroup>
    <ProtoGrain Include="Grains.proto" AdditionalImportDirs="." />
</ItemGroup>
```

ad 2) We need to add the following line to `Grains.proto`:

```proto
import "Messages.proto";
```


ad 3) We need to use `WithProtoMessages` on `Proto.Remote` configuration:

`ActorSystemConfiguration.cs`:

```csharp
using Proto.Remote;

// ...

// remote configuration

var remoteConfig = GrpcCoreRemoteConfig
    .BindToLocalhost()
    .WithProtoMessages(MessagesReflection.Descriptor);
```

### Extending a grain

Let's add a new method to our grain. It should look like this:

`Grains.proto`:

```proto
syntax = "proto3";

option csharp_namespace = "ProtoClusterTutorial";

import "Messages.proto";
import "google/protobuf/empty.proto";

service SmartBulbGrain {
  rpc TurnOn (google.protobuf.Empty) returns (google.protobuf.Empty);
  rpc TurnOff (google.protobuf.Empty) returns (google.protobuf.Empty);
  rpc GetState (google.protobuf.Empty) returns (GetSmartBulbStateResponse);
}
```

Implement this method:

`SmartBulbGrain.cs`

```csharp
public override Task<GetSmartBulbStateResponse> GetState()
{
    return Task.FromResult(new GetSmartBulbStateResponse
    {
        State = _state.ToString()
    });
}
```

Let's create an API method to call it:

`Program.cs`

```csharp
app.MapGet("/smart-bulbs/{identity}", async (ActorSystem actorSystem, string identity) =>
{
    return await actorSystem
        .Cluster()
        .GetSmartBulbGrain(identity)
        .GetState(CancellationToken.None);
});
```

Run the app and try navigating to `/smart-bulbs/bedroom` in your browser. You should get results similar to the following:

```json
{"state":"On"}
```


### Side note: grain activation

Let's use this moment to emphasise how grains work. Try navigating to: `/smart-bulbs/made-up-identity` or `/smart-bulbs/xyz123`. In both cases you should get:

```json
{"state":"Unknown"}
```

Proto.Custer will activate any grain you send a message to, even the ones you haven't anticipated. Sometimes this might require some additional handling, e.g. checking if a given identity is valid, is present in some sort of a database, etc. It's important to have this in the back of your head when designing a system using grains.


## Communicating between grains

To present how grains can communicate with each other, we'll create a new grain that will represent a smart house. It will be responsible for counting how many smart bulbs are on. For simplicity, we'll assume there's only one smart house with identity `my-house`. Each bulb will report its status to this smart house when it changes.


### Creating a new grain

Create a definition for a new grain:

`Grains.proto`:

```proto
service SmartHouseGrain {
  rpc SmartBulbStateChanged (SmartBulbStateChangedRequest) returns (google.protobuf.Empty);
}
```

Define the `SmartBulbStateChangedRequest` message:

`Messages.proto`:

```proto
message SmartBulbStateChangedRequest {
  string smart_bulb_identity = 1;
  bool is_on = 2;
}
```

Implement the grain:

`SmartHouseGrain.cs`:

```csharp
using Proto;
using Proto.Cluster;

namespace ProtoClusterTutorial;

public class SmartHouseGrain : SmartHouseGrainBase
{
    private readonly ClusterIdentity _clusterIdentity;

    private readonly SortedSet<string> _turnedOnSmartBulbs = new();

    public SmartHouseGrain(IContext context, ClusterIdentity clusterIdentity) : base(context)
    {
        _clusterIdentity = clusterIdentity;
        
        Console.WriteLine($"{_clusterIdentity.Identity}: created");
    }

    public override Task SmartBulbStateChanged(SmartBulbStateChangedRequest request)
    {
        if (request.IsOn)
        {
            _turnedOnSmartBulbs.Add(request.SmartBulbIdentity);
        }
        else
        {
            _turnedOnSmartBulbs.Remove(request.SmartBulbIdentity);
        }

        Console.WriteLine($"{_clusterIdentity.Identity}: {_turnedOnSmartBulbs.Count} smart bulbs are on");

        return Task.CompletedTask;
    }
}
``` 

Register this grain in the cluster by calling another `WithClusterKind` on `ClusterConfig`:

`ActorSystemConfiguration.cs`:

```csharp
.WithClusterKind(
    kind: SmartHouseGrainActor.Kind,
    prop: Props.FromProducer(() =>
        new SmartHouseGrainActor(
            (context, clusterIdentity) => new SmartHouseGrain(context, clusterIdentity)
        )
    )
);
```


### Sending messages between grains

Again, to call a grain, we need to use a `Cluster` object. In a grain, we can get it from an `IContext` instance. In grains generated with `Proto.Cluster.CodeGen`, it's available as a `Context` property.

Modify the smart bulb grain accordingly:

`SmartBulbGrain.cs`:

```csharp
public override async Task TurnOn()
{
    if (_state != SmartBulbState.On)
    {
        Console.WriteLine($"{_clusterIdentity.Identity}: turning smart bulb on");
        
        _state = SmartBulbState.On;
        
        await NotifyHouse();
    }
}

public override async Task TurnOff()
{
    if (_state != SmartBulbState.Off)
    {
        Console.WriteLine($"{_clusterIdentity.Identity}: turning smart bulb off");
        
        _state = SmartBulbState.Off;
        
        await NotifyHouse();
    }
}

public override Task<GetSmartBulbStateResponse> GetState()
{
    return Task.FromResult(new GetSmartBulbStateResponse
    {
        State = _state.ToString()
    });
}

private async Task NotifyHouse()
{
    await Context
        .GetSmartHouseGrain("my-house")
        .SmartBulbStateChanged(
            new SmartBulbStateChangedRequest
            {
                SmartBulbIdentity = _clusterIdentity.Identity,
                IsOn = _state == SmartBulbState.On
            },
            CancellationToken.None
        );
}
```

Try running the app. You should see console output similar to:

```txt
smart bulb simulator: turning off smart bulb 'living_room_2'
living_room_2: created
living_room_2: turning smart bulb off
my-house: created
my-house: 0 smart bulbs are on
smart bulb simulator: turning on smart bulb 'bedroom'
bedroom: created
bedroom: turning smart bulb on
my-house: 1 smart bulbs are on
smart bulb simulator: turning on smart bulb 'living_room_2'
living_room_2: turning smart bulb on
my-house: 2 smart bulbs are on
```