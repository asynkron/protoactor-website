---
title: Amazon ECS Cluster Provider (.NET)
---

# Amazon ECS Cluster Provider

Amazon ECS provider works very similar to Kubernetes provider. It registers a new member by adding tags to container instance running in ECS cluster. It also polls ECS cluster to receive information about all running instances.

Provider is available in `Proto.Cluster.AmazonECS` nuget package.

```csharp

static (GrpcNetRemoteConfig, IClusterProvider) ConfigureForAwsEcs(IConfiguration config)
    {
        var awsClient = new AmazonECSClient();
        var awsMetadataClient = new AwsEcsContainerMetadataHttpClient();
        var taskMetadata = awsMetadataClient.GetTaskMetadata();

        var clusterProvider = new AmazonEcsProvider
            (
                awsClient, 
                taskMetadata.Cluster, 
                taskMetadata.TaskARN, 
                new AmazonEcsProviderConfig()
            );

        var host = EmptyStringToNull(config["ProtoActor:Host"]) ?? "127.0.0.1";
        var port = TryParseInt(config["ProtoActor:Port"]) ?? 0;

        var remoteConfig = GrpcNetRemoteConfig
            .BindTo(host, port)
            .WithProtoMessages(YourProtoGrainReflecion.Descriptor);

        return (remoteConfig, clusterProvider);

        int? TryParseInt(string? intAsString) =>
            string.IsNullOrEmpty(intAsString)
                ? null
                : int.Parse(intAsString);

        string? EmptyStringToNull(string? someString) => string.IsNullOrEmpty(someString)
            ? null
            : someString;
    }

```
