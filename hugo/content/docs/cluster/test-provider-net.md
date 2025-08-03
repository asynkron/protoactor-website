---
title: Test cluster provider (.NET)
---

# Test provider

The easiest way to run clustered Proto.Actor setup during development on local machine (without using real clustering) is to use Test Cluster Provider.

This might be used together with other provider, e.g. in dev environment use test provider otherwise use production one. Example might be found in [Realtime map example](https://github.com/asynkron/realtimemap-dotnet/blob/main/Backend/ProtoActorExtensions.cs#L75).

Provider is available in `Proto.Cluster.TestProvider` nuget package.

```csharp

static (GrpcCoreRemoteConfig, IClusterProvider) ConfigureForLocalhost() 
        => (
            GrpcCoreRemoteConfig.BindToLocalhost(),  
            new TestProvider(new TestProviderOptions(), new InMemAgent())
        );

```
