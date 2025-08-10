---
title: Remote
---

# Proto.Remote

Scale out your actor systems over network using gRPC streaming.

In this article, we will explore what Proto.Remote is and how it helps us to create distributed systems in which actors are located on different machines connected by a network.

Proto.Remote abstracts many of the issues, such as serialization and communication over the network away from us, and lets us concentrate on the important thing, which is our application and our problem domain.

![remote title](images/Remote-2-blue.png)

## Location Transparency

The term **location transparency** is used in programming when the user or application does not know where the resource is located but only knows its name. A resource can be requested by name, and the system must be able to translate it into a unique identifier, which will then be associated with resource location. Proto.Remote offers location transparency that enables us to treat communication between actors on different machines the same as communication between actors in the local system. The picture below shows how the Proto.Remote works. 

![remote](images/remote.png)

For more info see [Location Transparency](https://proto.actor/docs/location-transparency/).

## Configuration

To get started with Proto.Remote, we need to configure the host address, register Protobuf messages, and Remote kinds. Below we will look at each action in detail.

### Network

First, we need to install two NuGet packages: `Proto.Remote` and `Proto.Remote.GrpcNet`.

To do this in Visual Studio open the Package Manager Console and type:

```ps
Install-Package Proto.Remote
Install-Package Proto.Remote.GrpcNet
```

**Warning!** From time to time you may see `Proto.Remote.GrpcCore` package used instead of `Proto.Remote.GrpcNet`. `Proto.Remote.GrpcCore` uses `Grpc.Core` package, and thus is considered deprecated. Read more about it [here](https://grpc.io/blog/grpc-csharp-future/).

To create Proto.Remote configuration that binds to a specified host address on a specified port we need to use method `BindTo(host, port)` from static class `GrpcNetRemoteConfig`. We can also create a configuration that binds to the localhost address by calling the method `BindToLocalHost(port)`. In both methods, the parameter `port` is optional. By default, it is 0, which means that any free port will be used.

```csharp
using Proto.Remote;
using Proto.Remote.GrpcNet;

var config = GrpcNetRemoteConfig
    .BindTo(advertisedHost, 12000)
    //or
    //.BindTo(advertisedHost)
    //or
    //.BindToLocalhost()
```

### Registering Protobuf messages

Protobuf is an interface definition language that defines contracts between services (messages and endpoints) in a natural language. We can take these contracts and use gRPC to generate clients and servers in different languages and take care of all of the underlying transport mechanisms and serialization/deserialization of those messages.

If we want to define a Protobuf message that has one string, then we need to create a .proto file with the content as shown below.

```protobuf
syntax = "proto3";
package MyMessages;
option csharp_namespace = "MyMessages";

message SomeMessage {
    string some_property = 1;
}
```

To generate code for working with message types created in a .proto file first we need to download [protocol buffer compiler protoc](https://developers.google.com/protocol-buffers/docs/downloads) and follow the instructions in the [README](https://github.com/protocolbuffers/protobuf/blob/master/examples/README.md). Then we run the compiler, specifying the directory where the source code of our application is located, the directory where we want to place the generated code, and the path to the `.proto` file. In this case, we need to call the following command: 

`protoc -I=$SRC_DIR --csharp_out=$DST_DIR $SRC_DIR/name.proto`

This command generates a library in C# which contains message classes and can be used as a reference from our client and server implementations. If we want to generate code in another programming language, just replace the option `--csharp_out` with the one we need.

For more information on Protobuf read [Protocol Buffers](https://developers.google.com/protocol-buffers/docs/overview).

In order to tell the configuration factory where to find the message from our Protobuf definition, we need to call the static method `WithProtoMessages` from class `RemoteConfigExtensions` and pass to it a descriptor with the namespace.

```csharp
var config = GrpcNetRemoteConfig
    .BindTo(advertisedHost, 12000)
    //like this
    .WithProtoMessages(MyMessagesReflection.Descriptor);
```

Read more about [Protobuf](https://proto.actor/docs/serialization/).

### Registering Remote Kinds

Proto.Remote allows us to spawn Proto actors that are located on different machines in a distributed system. In order to do this, we need to register the kinds of actors that can be spawned remotely.

To register what kind of actor can be called, we need to use the static method `WithRemoteKind` from class `RemoteConfigExtensions` and pass to it the name of the "kind" and a `Props`. This method creates a dictionary that maps the kind of an actor to `Props` and tells the Remote module how to set up and spawn an actor of that kind.

```csharp
var config = GrpcNetRemoteConfig
    .BindTo(advertisedHost, 12000)
    .WithProtoMessages(MyMessagesReflection.Descriptor)
    //like this
    .WithRemoteKind("echo", Props.FromProducer(() => new EchoActor()));
```

You can read more about remote spawning [here](https://proto.actor/docs/remote-spawn/).

### Configure gRPC compression

Proto.Remote allows bidirectional streaming between client and server using the gRPC framework. To optimize our bandwidth, we can configure gRPC compression. In order to do this, we need to call the static method `WithChannelOptions` and pass to it `GrpcChannelOptions` with created `GzipCompressionProvider` and select the compression level.

Compression is optional and might not always have the desired outcome. The bandwidth also depends on the workload and on the message size.

```csharp
var remoteConfig =
    GrpcNetRemoteConfig
    .BindTo(advertisedHost)
    .WithProtoMessages(ProtosReflection.Descriptor)
    //like this
    .WithChannelOptions(new GrpcChannelOptions
        {
            CompressionProviders = new[]
            {
                new GzipCompressionProvider(CompressionLevel.Fastest)
            }
        }
    );
```

```go
package main

import (
    "github.com/asynkron/protoactor-go/actor"
    remote "github.com/asynkron/protoactor-go/remote"
    "google.golang.org/grpc"
    "google.golang.org/grpc/encoding/gzip"
)

func main() {
    _ = gzip.Name // register gzip

    cfg := remote.Configure("127.0.0.1", 8080,
        remote.WithServerOptions(grpc.RPCCompressor(grpc.NewGZIPCompressor())),
        remote.WithDialOptions(grpc.WithDefaultCallOptions(grpc.UseCompressor(gzip.Name))),
    )

    remote.NewRemote(actor.NewActorSystem(), cfg).Start()
}
```

You can read more about gRPC compression [here](grpc-compression.md).

### Configure TLS

Proto.Remote can also secure connections with TLS certificates.

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

```go
package main

import (
    "github.com/asynkron/protoactor-go/actor"
    remote "github.com/asynkron/protoactor-go/remote"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials"
)

func main() {
    serverCreds, _ := credentials.NewServerTLSFromFile("server.crt", "server.key")
    clientCreds, _ := credentials.NewClientTLSFromFile("server.crt", "")

    cfg := remote.Configure("127.0.0.1", 8080,
        remote.WithServerOptions(grpc.Creds(serverCreds)),
        remote.WithDialOptions(grpc.WithTransportCredentials(clientCreds)),
    )

    remote.NewRemote(actor.NewActorSystem(), cfg).Start()
}
```

For a more complete example see [gRPC TLS](grpc-tls.md).

## Usage

In this section, we will look at how using just a few simple commands from Proto.Remote package we can create actors and organize communication between them in a distributed system.

### Spawning remote actors

After we have completed all the necessary configuration, all that remains is to spawn an actor using the `SpawnNamedAsync` method and send a message to it using the `context.Send` method. See the example below:

```csharp
var result = await system.Remote().SpawnNamedAsync("remoteaddress", "actor name", "actor kind", timeout);
context.Send(result.Pid, message);
```

In this article, we have examined what Proto.Remote is, how to configure it to spawn Proto.Actor on a remote machine, how to spawn an actor and send a message to it using Proto.Remote. For a more complete example of how to use Proto.Remote, see the article [Chat example using Proto.Remote](https://proto.actor/docs/chatexample/).
