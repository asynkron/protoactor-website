---
title: Consul cluster provider (.NET)
---

# Consul provider

If Proto.Actor application is not planned to be hosted in a container but e.g. on VMs, bare machine or it is needed to setup clustering on local machine, then this cluster membership provider is the easiest to setup.

Below sample consul provider configuration might be found. More details might be found [here](https://github.com/asynkron/protoactor-dotnet/tree/dev/examples/ClusterGrainHelloWorld).

Provider is available in `Proto.Cluster.Consul` nuget package.

```csharp
(GrpcCoreRemoteConfig, IClusterProvider) ConfigureForConsul(IConfiguration config)
    {
        var consulAddress = config["ProtoActor:Consul"];

        var clusterProvider = 
            new ConsulProvider(
                new ConsulProviderConfig(), 
                clientConfiguration: c => c.Address = new Uri(consulAddress)
            );

        var host = EmptyStringToNull(config["ProtoActor:Host"]) ?? "127.0.0.1";
        var port = TryParseInt(config["ProtoActor:Port"]) ?? 0;

        vvar remoteConfig = GrpcNetRemoteConfig
            .BindTo(host, port)
            .WithProtoMessages(YourProtoGrainReflecion.Descriptor);

        return (remoteConfig, clusterProvider);

        int? TryParseInt(string? intAsString) =>
            string.IsNullOrEmpty(intAsString)
                ? null
                : int.Parse(intAsString);

        string? EmptyStringToNull(string? someString) => 
            string.IsNullOrEmpty(someString)
                ? null
                : someString;
    }
```

Example of Consul configuration suitable for local environment might be found [here](https://github.com/asynkron/protoactor-dotnet/blob/dev/examples/ClusterGrainHelloWorld/docker-compose.yml).

## How it works?

Consul provider registers a new member in a cluster by using [register service](https://www.consul.io/commands/services/register) call to Consul. After that, in the loop, it [sends TTL](https://www.consul.io/api-docs/agent/check#ttl-check-pass). It also polls Consul to get update of any member from a cluster. After getting an update, it is propagated by using gossip.
