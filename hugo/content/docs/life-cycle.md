---
layout: docs.hbs
title: Actor Lifecycle
---

# Actor Lifecycle

![actor lifecycle](images/LifeCycle-blue.png)

<!-- Todo: Document which system messages can be handled by an actor. Started/Stopping/Restarting... -->

After an actor has been spawned, it goes through a lifecycle involving a number of possible states and actions. In the most basic case, a spawned actor is first created, or "incarnated", sent a `Started` message and will keep running until the application shuts down. There are however a few circumstances under which the lifecycle will be different.

## Actor States:

- Incarnated - Pseudo state - Actor is being constructed, not yet alive
- Started - Pseudo state - Actor is alive, and receives initial `Started` message
- `Alive` - Actor is alive, the normal running state
- `Stopping` - Actor is shutting down, preparing to be stopped
- `Restarting` - Actor is shutting down, preparing to restart
- `Stopped` - Actor is fully stopped and about to be removed from the system

## Stopping actors

An actor can also be stopped intentionally by calling the `PID.Stop()` method.

## Failure and supervision

When an actor fails to process a message, i.e. returns an error from it's receiver, the actor's mailbox will be suspended in order to halt further processing, and the failure will be escalated to whoever is supervising the actor (see [supervision](Supervision)). Depending on the directive the supervisor decides to apply, the actor may be either resumed, restarted or stopped.

### Resume

In this case the mailbox is simply resumed and the actor will continue running, starting with the previously failed message.

### Stop

In this case the actor will simply be stopped, and the underlying objects destroyed. Before being stopped the actor receives a `Stopping` message, and after being stopped it receives a `Stopped` message.

### Restart

In this case the actor will first be sent a `Restarting` message notifying it that it is about to be restarted. After this has been processed, the actor will be stopped, the underlying objects destroyed, and created again. Then the mailbox will be resumed and the newly created actor will receive a `Started` message.

## Handling lifecycle events

- `Started` is the first message received by an actor after it spawns or is restarted. Handle this message if you need to setup an initial state for the actor, e.g. load data from a database.
- `Restarting` is sent when an actor is about to restart, and `Stopping` is sent when an actor is about to be stopped. In both cases the actor object will be destroyed, so you should handle these messages if you need to execute some teardown logic to do a graceful shutdown, e.g. persist your state to a database.
- `Stopped` is sent when an actor has stopped and the actor, and it's related objects detached from the system. At this stage the actor can no longer send or receive any messages, and after the message has been processed the objects will be up for garbage collection.

## Flow diagram

![flow diagram](images/actorlifecycle.png)

## Example

In this demo application, we will be gradually adding handlers for various stages of the PlaybackActor lifecycle.

But before we begin, we need to make some changes to our project.

First of all, let's add some additional film descriptions to our project.

```csharp
system.Root.Send(pid, new PlayMovieMessage("The Movie", 44));
system.Root.Send(pid, new PlayMovieMessage("The Movie 2", 54));
system.Root.Send(pid, new PlayMovieMessage("The Movie 3", 64));
system.Root.Send(pid, new PlayMovieMessage("The Movie 4", 74));

```

Next, let's add a new ColorConsole class, which will allow you to change the color of the message displayed to the console without extra work.

```csharp
public static class ColorConsole
{
    public static void WriteLineGreen(string message)
    {
        var beforeColor = Console.ForegroundColor;

        Console.ForegroundColor = ConsoleColor.Green;

        Console.WriteLine(message);

        Console.ForegroundColor = beforeColor;
    }

    public static void WriteLineYellow(string message)
    {
        var beforeColor = Console.ForegroundColor;

        Console.ForegroundColor = ConsoleColor.Yellow;

        Console.WriteLine(message);

        Console.ForegroundColor = beforeColor;
    }
}
```

And finally, we'll edit our actor a little so that it can use the `ColorConsole () ' class, output the message content to the console in yellow. And also process different types of messages in separate methods.

```csharp
public class PlaybackActor : IActor
{
    public PlaybackActor() => Console.WriteLine("Creating a PlaybackActor");
    public Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case PlayMovieMessage msg:
                ProcessPlayMovieMessage(msg);
                break;
        }
        return Task.CompletedTask;
    }

    private void ProcessPlayMovieMessage(PlayMovieMessage msg)
    {
        ColorConsole.WriteLineYellow($"PlayMovieMessage {msg.MovieTitle} for user {msg.UserId}");
    }
}
```

Let's run our application and make sure that everything works right.

![](../../images/3_2_2.png)

Now, after all the necessary preparations, we can begin to study the system messages. And we will begin our introduction with the `Started` message.

### Started

The system message `Started` is used to inform our code the moment when the actor starts. Let's add the ability to process the `Started` message to the `ReceiveAsync ()` method.

```csharp
public class PlaybackActor : IActor
{
    public PlaybackActor() => Console.WriteLine("Creating a PlaybackActor");
    public Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Started msg:
                ProcessStartedMessage(msg);
                break;

            case PlayMovieMessage msg:
                ProcessPlayMovieMessage(msg);
                break;
        }
        return Task.CompletedTask;
    }
}
```

Now let's implement the `ProcessStartedMessage()` method in class `PlaybackActor`.

```csharp
private void ProcessStartedMessage(Started msg)
{
    ColorConsole.WriteLineGreen("PlaybackActor Started");
}
```

The `ProcessStartedMessage()` method will print a green message to the console, inform us that our actor has successfully started.

Let's launch our app and see what did we get.

![](../../images/3_2_2.png)

As you can see, the actor system created an instance of the actor `PlaybackActor` and sent it a `Started` message. Also, keep in mind that the system message `Started` will always be processed first. This means if you need to initialize your actor before starting the processing of custom messages. This code should be changed to the `Started` message handler.

### Restarting

If any failure occurs in the actor, the actor system will restart our actor to fix failure, to inform our actor of about an upcoming reboot, the actor system sends a `Restarting` message to our actor.

Unlike the `Started` message, working with the `Restarting` message will be slightly different.

First of all, we need to create a new message called `Recoverable`. This message will signal the child actor to generate an exception to simulate an actor's failure. Next, create the child actor `ChildActor` itself and add the code for processing the `Restarting` and Recoverable messages to its `ReceiveAsync()` method.

```csharp
public Task ReceiveAsync(IContext context)
{
    switch (context.Message)
    {
        case Restarting msg:
            ProcessRestartingMessage(msg);
            break;

        case Recoverable msg:
            ProcessRecoverableMessage(msg);
            break;
    }
    return Task.CompletedTask;
}
```

```csharp
private void ProcessRestartingMessage(Restarting msg)
{
    ColorConsole.WriteLineGreen("ChildActor Restarting");
}
```

```csharp
private void ProcessRecoverableMessage(Recoverable msg)
{
    throw new Exception();
}
```

Now let's change the `Playback Actor ' so that it can accept our new messages.

```csharp
public class PlaybackActor : IActor
{
    public PlaybackActor() => Console.WriteLine("Creating a PlaybackActor");
    public Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Started msg:
                ProcessStartedMessage(msg);
                break;

            case PlayMovieMessage msg:
                ProcessPlayMovieMessage(msg);
                break;

            case Recoverable msg:
                ProcessRecoverableMessage(context, msg);
                break;
        }
        return Task.CompletedTask;
   }

    private void ProcessStartedMessage(Started msg)
    {
        ColorConsole.WriteLineGreen("PlaybackActor Started");
    }

    private void ProcessPlayMovieMessage(PlayMovieMessage msg)
    {
        ColorConsole.WriteLineYellow($"PlayMovieMessage {msg.MovieTitle} for user {msg.UserId}");
    }

    private void ProcessRecoverableMessage(IContext context, Recoverable msg)
    {
        PID child;

        if (context.Children == null || context.Children.Count == 0)
        {
            var props = Props.FromProducer(() => new ChildActor());
            child = context.Spawn(props);
        }
        else
        {
            child = context.Children.First();
        }

        context.Forward(child);
    }
```

In the `ProcessRecoverableMessage` method, we define whether our class has a child actor, and if our actor doesn't have child actors, we create these actors. If our actor has child actors, we extract their PID and store these PIDs in a variable. After we get the PID of the child actor, we send it the message `Recoverable`, using the method `context.Forward(child);`.

Now, all we have to do is change the `Program ' class so that it can support the child actor monitoring strategy. You will learn more about it in the next lessons, but for now, just copy the following code into your app.

```csharp
class Program
{
    static void Main(string[] args)
    {
        var system = new ActorSystem();
        Console.WriteLine("Actor system created");

        var props = Props.FromProducer(() => new PlaybackActor()).WithChildSupervisorStrategy(new OneForOneStrategy(Decider.Decide, 1, null));
        var pid = system.Root.Spawn(props);

        system.Root.Send(pid, new PlayMovieMessage("The Movie", 44));
        system.Root.Send(pid, new PlayMovieMessage("The Movie 2", 54));
        system.Root.Send(pid, new PlayMovieMessage("The Movie 3", 64));
        system.Root.Send(pid, new PlayMovieMessage("The Movie 4", 74));

        Thread.Sleep(50);
        Console.WriteLine("press any key to restart actor");
        Console.ReadLine();

        system.Root.Send(pid, new Recoverable());
        Console.ReadLine();
    }

    private class Decider
    {
        public static SupervisorDirective Decide(PID pid, Exception reason)
        {
            return SupervisorDirective.Restart;
        }
    }
}
```

When you run our test application, you will see that the child actor has been rebooted and informing you about it.

![](../../images/3_2_3.png)

### Stopping

To notify the actor that it will soon be stopped, the actor system sends him a `Stopping` message.

Processing the actor stop may be necessary when you want to release the resources you are using. For example. These resources may be a connection to a database or an open file descriptor.

Let's implement the processing of the message `Stopping` in our actor. To do this, let's add the `Stopping` message processing to the `ReceiveAsync()` method.

```csharp
public Task ReceiveAsync(IContext context)
{
    switch (context.Message)
    {
        case Started msg:
            ProcessStartedMessage(msg);
            break;

        case PlayMovieMessage msg:
            ProcessPlayMovieMessage(msg);
            break;

        case Stopping msg:
            ProcessStoppingMessage(msg);
            break;
    }
    return Task.CompletedTask;
}
```

And let's implement method `ProcessStoppingMessage()` . This method will display a stop message on the console.

```csharp
private void ProcessStoppingMessage(Stopping msg)
{
    ColorConsole.WriteLineGreen("PlaybackActor Stopping");
}
```

For stopping the actor, we need to use the `RootContex.Stop()` method and pass it the PID of the actor we want to stop. Let's change our `Program` class so that it can stop our actor.

```csharp
class Program
{
    static void Main(string[] args)
    {
        var system = new ActorSystem();
        Console.WriteLine("Actor system created");

        var props = Props.FromProducer(() => new PlaybackActor()).WithChildSupervisorStrategy(new OneForOneStrategy(Decider.Decide, 1, null));
        var pid = system.Root.Spawn(props);

        system.Root.Send(pid, new PlayMovieMessage("The Movie", 44));
        system.Root.Send(pid, new PlayMovieMessage("The Movie 2", 54));
        system.Root.Send(pid, new PlayMovieMessage("The Movie 3", 64));
        system.Root.Send(pid, new PlayMovieMessage("The Movie 4", 74));

        Thread.Sleep(50);
        Console.WriteLine("press any key to restart actor");
        Console.ReadLine();

        system.Root.Send(pid, new Recoverable());

        Console.WriteLine("press any key to stop actor");
        Console.ReadLine();
        system.Root.Stop(pid);

        Console.ReadLine();
    }

    private class Decider
    {
        public static SupervisorDirective Decide(PID pid, Exception reason)
        {
            return SupervisorDirective.Restart;
        }
    }
}
```

Now that we launch our application and press any key, we will see that our actor has received an alert about his emergency stop.

![](images/3_2_4.png)
