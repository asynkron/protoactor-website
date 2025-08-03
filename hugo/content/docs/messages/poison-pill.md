# PoisonPill

`Stop` and `PoisonPill` messages used to terminate the actor and stop the message queue. Both of these messages force the actor to stop processing incoming messages, and send a stop message to all of its child actors, and wait until they are finished. Then, send our code a message `Stopped` that signals the actor's complete shutdown. Keep in mind that all future messages sent to our actor's address will be forwarded to dead letters mailbox.

`Stop` will stop the actor immediately, ignoring if there are other user messages present in the mailbox.

`PoisonPill` is a **user-level message** that is placed on the mailbox queue. and processed in order just like any other user message. So you can use that to gracefully stop an actor after all existing messages have been processed.

Let's see how we can send a message `PoisonPill` to our actor `PlaybackActor`.

Let's open our project and add the sending of the message `PoisonPill` to the class `Program`. You can do it with the help of `Poison()` method

```csharp
system.Root.Poison(pid);
```

As a result, we should get the following code.

```csharp
var system = new ActorSystem();
Console.WriteLine("Actor system created");

var props = Props.FromFunc(ctx => Task.CompletedTask);
var pid = system.Root.Spawn(props);

system.Root.Send(pid, "a string message");

system.Root.Poison(pid);

Console.ReadLine();
```

Now we need to edit the `PlaybackActor` so that it can handle the `Stopped` message.

```csharp
public class PlaybackActor : IActor
{
    public PlaybackActor() => Console.WriteLine("Creating a PlaybackActor");
    public Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case PlayMovieMessage msg:
                Console.WriteLine($"Received movie title {msg.MovieTitle}");
                Console.WriteLine($"Received user ID {msg.UserId}");
                break;

            case Stopped msg:
                Console.WriteLine("actor is Stopped");
                break;
        }
        return Task.CompletedTask;
    }
}
```

Let's launch our app and see what happened.

![](images/3_4_1.png)

Let's replace `Poison()` call with `Stop()` and launch our app to see what happened.

```diff
- system.Root.Poison(pid);
+ system.Root.Stop(pid);
```

![](images/3_4_2.png)

As you can see, the actor successfully completed job.

{{< listfiles "dotnet" >}}

[Go ahead!](../lesson-5)
