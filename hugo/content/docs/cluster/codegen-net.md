---
title: Generating grains (.NET)
---

# Generating grains (.NET)

The recommended way of creating a grain is by using a `Proto.Cluster.CodeGen` package, which generates most of the grain's code for use from a `.proto` file.

This approach:

1. Mitigates a lot of gotchas related to developing grains by hand, e.g. by preventing us from not returning a response from a request or not returning any response at all (which is almost always required by grains).

1. Reduces boilerplate code and lets you focus on functionality.

## Prerequisites

To generate grains, you'll need the `Proto.Cluster.CodeGen` NuGet package:

```sh
dotnet add package Proto.Cluster.CodeGen
```

## Generating a grain

Grains are defined and generated from `.proto` files, similarly to gRPC services.

**Example**

`CounterGrain.proto`:

```protobuf
syntax = "proto3";

option csharp_namespace = "MyProject";

import "google/protobuf/empty.proto";

service CounterGrain {
  rpc Increment (google.protobuf.Empty) returns (google.protobuf.Empty);
}
```

You can define multiple messages and services in a single `.proto` file.

Code generation is performed by the `ProtoGrain` MSBuild task. It needs to be defined in a project file.

**Example**

`MyProject.csproj`:

```xml
<ItemGroup>
    <ProtoGrain Include="CounterGrain.proto" />
</ItemGroup>
```

## Importing messages

To use messages defined in a different `.proto` file, you'll need to import it.

The `ProtoGrain` MSBuild task should know where to look for additional `.proto` files.

**Example**

`MyProject.csproj`:

```xml
<ItemGroup>
    <ProtoGrain Include="CounterGrain.proto" AdditionalImportDirs="." />
</ItemGroup>
```

`AdditionalImportDirs` is a semicolon-separated list of directories, which should contain `.proto` files to be imported.

Now messages can be imported in a grain definition file.

**Example**

Assuming there's a `CounterGrainMessages.proto` definition with a `CounterValue` message:

`CounterGrain.proto`:

```protobuf
syntax = "proto3";

option csharp_namespace = "MyProject";

import "google/protobuf/empty.proto";
import "CounterGrainMessages.proto";

service CounterGrain {
  rpc Increment (google.protobuf.Empty) returns (google.protobuf.Empty);
  rpc GetCurrentValue (google.protobuf.Empty) returns (CounterValue);
}
```

## Generated code

Building the project should result in generating a `<grain name>-<hash>.cs` file in `<project>\obj\<configuration>\<target>\protopotato` directory.

**Example**

```txt
MyProject\obj\Debug\net6.0\protopotato\CounterGrain-9DAD25B670A612931CE9F63A07C26BDF.cs
```

The generated `.cs` file includes:

1. `<grain>Base` abstract class, that needs to be implemented. More on implementing it below.

1. `<grain>Actor` class, which wraps implementation of `<grain>Base`. It's the actual actor that's activated by Proto.Cluster. More on using it below.

1. `<grain>Client` class for communicating with a grain. `Cluster` and `IContext` extension methods are also generated for creating a client. More on using them below.

**Example**

`CounterGrain.proto` would generate the following classes:

1. `CounterGrainBase`
1. `CounterGrainActor`
1. `CounterGrainClient`

It would also generate `GetSmartBulbGrain` extension methods for `Cluster` and `IContext`.

## Implementing a grain

To implement the actual grain logic, we need to implement generated `<grain>Base` abstract class.

**Example**

`CounterGrain.cs`:

```csharp
using Proto;
using Proto.Cluster;

namespace MyProject;

public class CounterGrain : CounterGrainBase
{
    private int _value = 0;

    public CounterGrain(IContext context) : base(context)
    {
    }

    public override Task Increment()
    {
        _value++;
        return Task.CompletedTask;
    }

    public override Task<CounterValue> GetCurrentValue()
    {
        return Task.FromResult(new CounterValue
        {
            Value = _value
        });
    }
}
```

Mind, that `<grain>Base` abstract class looks like an actor, but it doesn't implement `IActor` interface. To use it, it must be wrapped in `<grain>Actor` class.

## Registering a grain

Grain has to be registered in `ClusterConfiguration` using a `WithClusterKind` method.

**Example**

```csharp
using Proto;
using Proto.Cluster;

var clusterConfig = ClusterConfig
    .Setup(/* ... */)
    .WithClusterKind(
        kind: CounterGrainActor.Kind,
        prop: Props.FromProducer(() =>
            new CounterGrainActor(
                (context, clusterIdentity) => new CounterGrain(context)
            )
        )
    );
```

{{< warning >}}
It's highly recommended to use `<grain>Actor.Kind` constant instead of inline strings, as invalid grain kinds lead to difficult to find errors.
{{</ warning >}}

## Sending messages to grains

Messages should be sent to a grain using a `<grain>Client` class. To get it, use `Get<grain>(identity)` extension method on `Cluster` or `IContext`.

**Example**

```csharp
CounterGrainClient client = cluster.GetCounterGrain("click-counter");
// or
CounterGrainClient client = context.GetCounterGrain("click-counter");
```

A client class defines a method for each message type handled by a grain.

**Example**

```csharp
Empty? incrementResponse = await client.Increment(
    ct: CancellationTokens.FromSeconds(5)
);

CounterValue? getCurrentValueResponse = await client.GetCurrentValue(
    ct: CancellationTokens.FromSeconds(5)
);
```

### Timeouts

The result will be `null` if a request timeouts, so this should always be checked.

Timeouts should be handled using cancellation tokens. It's recommended to use Proto.Actor's `CancellationTokens` utility for this purpose.

### Exception handling

If a grain implementation throws an exception when handling a request:

1. A `GrainErrorResponse` will be sent as a response.

1. `<grain>Client` will receive a `GrainErrorResponse` and throw an `Exception`.

## Context

In contrast to classical actors, context is not passed as a parameter, but available as a property in `<grain>Base` class.

**Example**

```csharp
public override Task Increment()
{
    IContext context = Context;

    // ...
}
```

## Cluster identity

The grain's _cluster identity_ (i.e. grain's _kind_ and _identity_) can be obtained from the context:

```csharp
using Proto;
using Proto.Cluster;

// grain implementation:

ClusterIdentity clusterIdentity = Context.ClusterIdentity()!;
```

**Example**

```csharp
public override Task Increment()
{
    var clusterIdentity = Context.ClusterIdentity()!;
    Console.WriteLine($"Incrementing {clusterIdentity.Kind} / {clusterIdentity.Identity}");

    // ...
}
```

Alternatively, cluster identity can be injected during activation.

**Example**

Cluster configuration:

```csharp
var clusterConfig = ClusterConfig
    .Setup(/* ... */)
    .WithClusterKind(
        kind: CounterGrainActor.Kind,
        prop: Props.FromProducer(() =>
            new CounterGrainActor(
                (context, clusterIdentity) => new CounterGrain(context, clusterIdentity)
            )
        )
    );
```

Grain implementation:

```csharp
public class CounterGrain : CounterGrainBase
{
    private readonly ClusterIdentity _clusterIdentity;

    public CounterGrain(IContext context, ClusterIdentity clusterIdentity) : base(context)
    {
        _clusterIdentity = clusterIdentity;
    }
}
```

{{< warning >}}
Cluster identity should not be confused with actor's PID (`Context.Self`) or ID (`Context.Self.Id`).
{{</ warning >}}

## Lifecycle hooks

Grain implementation can override a few lifecycle methods:

1. `Task OnStarted()` is called when `<grain>Actor` receives `Stared` event.
1. `Task OnStopping()` is called when `<grain>Actor` receives `Stopping` event.
1. `Task OnStopped()` is called when `<grain>Actor` receives `Stopped` event.

**Example**

```csharp
public override Task OnStarted()
{
    Console.WriteLine("Starting counter");
    return Task.CompletedTask;
}

public override Task OnStopping()
{
    Console.WriteLine("Stopping counter");
    return Task.CompletedTask;
}

public override Task OnStopped()
{
    Console.WriteLine("Stopped counter");
    return Task.CompletedTask;
}
```

You can read more about the actor lifecycle [here](../life-cycle.md).

## Receiving messages outside of grain's contract

Sometimes there is a need to handle messages that are outside of grain's contract, i.e. are not defined in grain service in `.proto` file. This can be done via overriding `Task OnReceive()` method:

```csharp
public override async Task OnReceive()
{
    switch (Context.Message)
    {
        // ...
    }
}
```

The use cases of such approach include, but are not limited to:

1. Receiving messages from grain's child actors.

1. Subscribing to the event stream, e.g. `Context.System.EventStream.Subscribe<SomeMessage>(Context.System.Root, Context.Self);`.

1. Detecting inactive grains, see [receive timeout](../receive-timeout.md).

## Dependency injection

A convenient way of utilizing dependency injection with grains is using `ActivatorUtilities.CreateInstance` and `IServiceProvider` when configuring grain's props.

**Example**

Service registration:

```csharp
services.AddSingleton<INotificationSender, SlackNotificationSender>();
```

Cluster configuration:

```csharp
using Microsoft.Extensions.DependencyInjection;

var clusterConfig = ClusterConfig
    .Setup(/* ... */)
    .WithClusterKind(
        kind: CounterGrainActor.Kind,
        prop: Props.FromProducer(() =>
            new CounterGrainActor((context, _) =>
                ActivatorUtilities.CreateInstance<CounterGrain>(provider, context)
            )
        )
    );
```

Grain implementation:

```csharp
public class CounterGrain : CounterGrainBase
{
    private readonly INotificationSender _notificationSender;

    public CounterGrain(IContext context, INotificationSender notificationSender) : base(context)
    {
        _notificationSender = notificationSender;
    }
}
```
