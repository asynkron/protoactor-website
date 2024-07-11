
# `Touch` and `Touched` Messages

This guide demonstrates how to use the `Touch` and `Touched` messages in Proto.Actor. The `Touch` message is an auto-respond message used to check actors' liveness. When an actor receives a `Touch` message, it automatically responds with a `Touched` message without processing the `Touch` message.

## Setting Up Auto-Respond for Touch Message

### Example: Using Touch and Touched Messages

```csharp
using System;
using Proto;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var props = Props.FromProducer(() => new MyActor());

        var actorSystem = new ActorSystem();
        var rootContext = actorSystem.Root;

        var pid = rootContext.Spawn(props);

        // Send a Touch message to check liveness
        var response = await rootContext.RequestAsync<Touched>(pid, new Touch());

        // Check the response
        if (response != null)
        {
            Console.WriteLine("Actor is alive");
        }
        else
        {
            Console.WriteLine("Actor did not respond");
        }

        // Keep the application running to observe the output
        Console.ReadLine();
    }
}

class MyActor : IActor
{
    public Task ReceiveAsync(IContext context)
    {
        if (context.Message is string message)
        {
            Console.WriteLine(message);
        }

        return Task.CompletedTask;
    }
}
```

### Explanation

1. **Initialize Actor System**:
    - An `ActorSystem` instance is created, and the root context is obtained.

2. **Send Touch Message**:
    - The `Touch` message is sent to the actor to check its liveness.
    - The actor system automatically responds with a `Touched` message without the actor processing the `Touch` message.

3. **Verify Response**:
    - The response is checked to determine if the actor is alive.
    - A message is printed to the console based on whether the actor responded.

### Running the Example

To run this example:
- Copy the code into a `.cs` file.
- Ensure you have the Proto.Actor library installed.
- Compile and run the program.
- Observe the console output to see the auto-respond functionality in action.

---

By following this guide, you can implement liveness checks for actors using the `Touch` and `Touched` messages in Proto.Actor.
