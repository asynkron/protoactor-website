# gRPC Compression

Configure gRPC compression for Proto.Remote


```csharp
var remoteConfig = 
    GrpcNetRemoteConfig
    .BindTo(advertisedHost)
    .WithChannelOptions(new GrpcChannelOptions
        {
            CompressionProviders = new[]
            {
                new GzipCompressionProvider(CompressionLevel.Fastest)
            }
        }
    )
    .WithProtoMessages(ProtosReflection.Descriptor);

```