
# `Started` Message

The `Started` message is a system message in Proto.Actor that is sent to an actor when it first starts. This message is handled internally by the actor system to initialize the actor lifecycle.

## Overview

The `Started` message is a part of the lifecycle management in Proto.Actor and is crucial for the initialization of actors. It allows for the execution of start-up logic, such as resource allocation or initial state setup. This message is automatically sent by the actor system when an actor is created.

## Usage

The `Started` message does not need to be sent by user code; it is automatically handled by the actor system. However, you can respond to this message within your actor by overriding the `OnReceive` method or by using middleware.

### Example

Here is a basic example of an actor handling the `Started` message:

```csharp
using Proto;
using System;

public class MyActor : IActor
{
    public Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Started _:
                Console.WriteLine("Actor started");
                break;
        }
        return Task.CompletedTask;
    }
}
```

In this example, the `MyActor` class implements the `IActor` interface and defines behavior in the `ReceiveAsync` method to handle the `Started` message. When the `Started` message is received, the actor simply prints "Actor started" to the console.

## Conclusion

The `Started` message is a fundamental part of the actor lifecycle in Proto.Actor, signifying that an actor has been successfully created and started. By handling this message, developers can perform any necessary initialization tasks.
