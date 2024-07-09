
# `Stop`, `Stopping`, and `Stopped` Messages

These messages are part of the lifecycle management in Proto.Actor, helping manage the shutdown process of actors efficiently and safely.

## Overview

- `Stop`: A command message to stop an actor.
- `Stopping`: A system message indicating that an actor is in the process of stopping.
- `Stopped`: A system message indicating that an actor has completely stopped.

These messages facilitate the graceful shutdown of actors, allowing for cleanup and other shutdown logic to be executed.

## Usage

These messages, particularly `Stop`, can be sent by user code to initiate the stopping process, while `Stopping` and `Stopped` are handled internally by the actor system.

### Example

Here is an example of handling these messages in an actor:

```csharp
using Proto;
using System;

public class MyActor : IActor
{
    public Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Stopping _:
                Console.WriteLine("Actor is stopping.");
                break;
            case Stopped _:
                Console.WriteLine("Actor has stopped.");
                break;
        }
        return Task.CompletedTask;
    }
}
```

## Actor System and Root Context

To stop an actor from the `ActorSystem` using `RootContext`:

```csharp
var pid = system.Root.Spawn(props);
system.Root.Stop(pid);
//or await system.Root.StopAsync(pid)
```

## Conclusion

The `Stop`, `Stopping`, and `Stopped` messages are integral to the lifecycle management of actors in Proto.Actor, ensuring that actors terminate in a controlled and clean manner. This management is crucial for releasing resources and avoiding memory leaks.
