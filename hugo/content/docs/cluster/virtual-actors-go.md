---
layout: docs.hbs
title: Virtual actors (Go)
---

# Virtual actors (Go)

### Generate Typed Virtual Actors

The first thing you need to do is to define your messages and grain contracts.
You do this by using Protobuf IDL files.

This is the definition from the `/examples/cluster/shared` example

```protobuf
syntax = "proto3";
package shared;

message HelloRequest {
  string name = 1;
}

message HelloResponse {
  string message = 1;
}

message AddRequest {
  double a = 1;
  double b = 2;
}

message AddResponse {
  double result = 1;
}

service Hello {
  rpc SayHello (HelloRequest) returns (HelloResponse) {}
  rpc Add(AddRequest) returns (AddResponse) {}
}
```

Once you have this, you can generate your code using protoc.

#### Generating code for Go

##### Windows

```bash
protoc -I=. -I=%GOPATH%\src --gogoslick_out=. protos.proto
protoc -I=. -I=%GOPATH%\src --gorleans_out=. protos.proto
```

## Implementing

When the contracts have been generated, you can start implementing your grains:

```go
package shared

//a Go struct implementing the Hello interface
type hello struct {
}

func (*hello) SayHello(r *HelloRequest) *HelloResponse {
	return &HelloResponse{Message: "hello " + r.Name}
}

func (*hello) Add(r *AddRequest) *AddResponse {
	return &AddResponse{Result: r.A + r.B}
}

//Register what implementation GAM should use when
//creating actors for a certain grain type.
func init() {
	//apply DI and setup logic
	HelloFactory(func() Hello { return &hello{} })
}
```

Show examples how to codegen grains

...
