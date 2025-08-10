---
title: gRPC Compression
---

# gRPC Compression

Configure gRPC compression for Proto.Remote.

## .NET

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

## Go

```go
package main

import (
    "github.com/asynkron/protoactor-go/actor"
    "google.golang.org/grpc"
    "google.golang.org/grpc/encoding/gzip"

    remote "github.com/asynkron/protoactor-go/remote"
)

func main() {
    // Register gzip and enable it for both client and server
    _ = gzip.Name

    cfg := remote.Configure("127.0.0.1", 8080,
        remote.WithServerOptions(grpc.RPCCompressor(grpc.NewGZIPCompressor())),
        remote.WithDialOptions(grpc.WithDefaultCallOptions(grpc.UseCompressor(gzip.Name))),
    )

    remote.NewRemote(actor.NewActorSystem(), cfg).Start()
}

```
