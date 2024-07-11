
# `Watch` and `Unwatch` Messages

This guide explains the `Watch` and `Unwatch` messages in Proto.Actor, which are used for monitoring the lifecycle of actors.

## Watch

The `Watch` message is used to monitor another actor's lifecycle. When an actor watches another actor, it will be notified if the watched actor terminates. This is useful for building fault-tolerant systems where an actor needs to take action if another actor it depends on stops.

## Unwatch

The `Unwatch` message is used to stop monitoring another actor's lifecycle. When an actor unwatches another actor, it will no longer receive termination notifications for that actor.

## Example: Using Watch and Unwatch Messages

```csharp
using System;
using Proto;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var actorSystem = new ActorSystem();
        var rootContext = actorSystem.Root;

        var props = Props.FromProducer(() => new MyActor());
        var pid = rootContext.Spawn(props);

        var watcherProps = Props.FromProducer(() => new WatcherActor(pid));
        var watcherPid = rootContext.Spawn(watcherProps);

        // Keep the application running to observe the output
        Console.ReadLine();
    }
}

class MyActor : IActor
{
    public Task ReceiveAsync(IContext context)
    {
        return Task.CompletedTask;
    }
}

class WatcherActor : IActor
{
    private readonly PID _target;

    public WatcherActor(PID target)
    {
        _target = target;
    }

    public Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Started _:
                // Start watching the target actor
                context.Watch(_target);
                Console.WriteLine($"Started watching {_target}");
                break;
            case Terminated msg when msg.Who.Equals(_target):
                // Handle the termination of the target actor
                Console.WriteLine($"Actor {_target} has terminated");
                break;
        }
        return Task.CompletedTask;
    }
}
```

### Explanation

1. **Watch**:
    - The `WatcherActor` starts watching the target actor (`MyActor`) when it starts.
    - This is done using the `context.Watch(_target)` method, which sends a `Watch` message to the target actor.

2. **Handle Termination**:
    - When the target actor terminates, the `WatcherActor` receives a `Terminated` message.
    - The termination is handled in the `ReceiveAsync` method, where appropriate actions can be taken.

3. **Unwatch**:
    - To stop watching the target actor, the `context.Unwatch(_target)` method can be used, which sends an `Unwatch` message to the target actor.

### Running the Example

To run this example:
- Copy the code into a `.cs` file.
- Ensure you have the Proto.Actor library installed.
- Compile and run the program.
- Observe the console output to see the watch and unwatch functionality in action.

---

By following this guide, you can effectively monitor the lifecycle of actors using the `Watch` and `Unwatch` messages in Proto.Actor.
