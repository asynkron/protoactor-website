# Proto.Remote

Scale out your actor systems over network using gRPC streaming.

<img src="../images/Remote-2-blue.png" style="max-height:400px;margin-bottom:20px;margin-left:20px">

## Configuration

//intro

### Network

describe how to set up the local endpoint
install proto.remote, proto.remote.grpcnet or proto.remote.grpccore

describe how to use the various .BindTo / BindToLocalhost etc.
describe that port 0 means any free port

```csharp
var config = GrpcCoreRemoteConfig
    .BindTo(advertisedHost, 12000)
    //or
    //.BindTo(advertisedHost)
    //or
    //.BindToLocalhost()
```

### Registering Protobuf Messages

describe how to define a protobuf message
describe how to set up build time compilation of protobuf messages using Google.Grpc.Toools nuget

```protobuf
syntax = "proto3";
package MyMessages;
option csharp_namespace = "MyMessages";

message SomeMessage {
    string some_property = 1;
}
```

For more information on Protobuf [read more](https://developers.google.com/protocol-buffers/docs/overview).

describe how to register userdefined protobuf messages for Proto.Remote

```csharp
var config = GrpcCoreRemoteConfig
    .BindTo(advertisedHost, 12000)
    //like this
    .WithProtoMessages(MyMessagesReflection.Descriptor);
```

link to serialization.md for more info

### Registering Remote Kinds

describe what remote kinds are
describe how to set up a remote kind.

```csharp
var config = GrpcCoreRemoteConfig
    .BindTo(advertisedHost, 12000)
    .WithProtoMessages(MyMessagesReflection.Descriptor)
    //like this
    .WithRemoteKind("echo", Props.FromProducer(() => new EchoActor()));
```

link to remote-spawn.md for more info

### Configure gRPC Compression

describe how to configure grpc compression for optimized bandwith
describe that this is optional and might not always have the desired outcome, it depends on workload and message size

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

link to grpc-compression.md

## Usage

fluff-intro, this is how you communicate between two or more nodes using Proto.Remote

### Spawning remote actors

fluff-intro, this is how you spawn and send to the remote actor

```csharp
var result = await system.Remote().SpawnNamedAsync("remoteaddress", "actor name", "actor kind", timeout);
context.Send(result.Pid, message);
```

blablabla, for a more complete example on how to use Proto.Remote, see the Proto.Remote Chat article here:
[Chat example using Proto.Remote](/docs/chatexample/)
