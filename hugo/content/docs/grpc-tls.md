---
title: gRPC TLS
---

# gRPC TLS

Proto.Remote can secure communication channels using TLS certificates.

## Generating a development certificate

```bash
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
openssl pkcs12 -export -out localhost.pfx -inkey key.pem -in cert.pem -passout pass:password
```

## .NET

Server configuration:

```csharp
var certificate = new X509Certificate2("localhost.pfx", "password");
var remoteConfig = GrpcNetRemoteConfig.BindTo(advertisedHost) with
{
    UseHttps = true,
    ConfigureKestrel = options =>
    {
        options.Protocols = HttpProtocols.Http2;
        options.UseHttps(certificate);
    }
};
```

Client validation:

```csharp
var certificate = new X509Certificate2("localhost.pfx", "password");
var handler = new HttpClientHandler();
handler.ServerCertificateCustomValidationCallback = (request, cert, chain, errors) =>
    cert != null && cert.Thumbprint == certificate.Thumbprint;

var remoteConfig = GrpcNetRemoteConfig.BindToLocalhost() with
{
    UseHttps = true,
    ChannelOptions = new GrpcChannelOptions { HttpHandler = handler }
};
```

## Go

```go
package main

import (
    "github.com/asynkron/protoactor-go/actor"
    remote "github.com/asynkron/protoactor-go/remote"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials"
)

func main() {
    // Load server cert and key
    serverCreds, _ := credentials.NewServerTLSFromFile("server.crt", "server.key")
    // Client credentials verify the server certificate
    clientCreds, _ := credentials.NewClientTLSFromFile("server.crt", "")

    cfg := remote.Configure("127.0.0.1", 8080,
        remote.WithServerOptions(grpc.Creds(serverCreds)),
        remote.WithDialOptions(grpc.WithTransportCredentials(clientCreds)),
    )

    remote.NewRemote(actor.NewActorSystem(), cfg).Start()
}
```

This configuration enables encrypted gRPC streaming between Proto.Actor nodes.
