---
title: "Messages"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Messages

One of the most fundamental concepts to the Actor model is the notion of ["message-driven systems," as defined by the Reactive Manifesto](http://www.reactivemanifesto.org/glossary#Message-Driven "Reactive Manifesto"):

> A message is an item of data that is sent to a specific destination. An event is a signal emitted by a component upon reaching a given state. In a message-driven system addressable recipients await the arrival of messages and react to them, otherwise lying dormant.

**Message-passing** is how Proto.Actor actors communicate with each other in Proto.Actor.

## How are messages defined?
In Proto.Actor messages are simple objects:

#### .NET

```csharp
public record MyMessage(string Name);
```

#### Go

```go
type MyMessage struct {
    Name string
}
```


Proto.Actor allows you to automatically pass around these messages to any actor, whether it's an actor running inside your application's local process or a remote actor running on a different machine. Proto.Actor can automatically serialize and route your message to its intended recipient(s.)

## Actors change their internal state based on the content of messages

One of the defining characteristics of actors is that they have the ability to change their state in a thread-safe way, and they do this based on the content of messages they receive.

Here's a simple example:

#### .NET

```csharp
using System;
using Proto;


/* message definition */
public class MyMessage
{
    public MyMessage(string name)
    {
        Name = name;
    }

    public string Name {get;private set;}
}

public record Hi;

/* actor definition */
public class MyActor : IActor
{
    string lastActorName;

    public Task ReceiveAsync(Context context)
    {
        switch(context.Message)
        {
            case MyMessage msg:
                lastActorName = msg.Name;
                break;
            case Hi _:
                Console.WriteLine( $"Hi {lastActorName}!");
                break,
        }
        return Task.CompletedTask;
    }
}

public class Program
{
    public static void Main()
    {
        var system = new ActorSystem();
        var myActor = system.Root.Spawn(Props.FromProducer(() => new MyActor));
        system.Root.Send(myActor, new MyMessage("Hello World"));
        system.Root.Send(myActor,new Hi());
    }
}
```


`MyActor.lastActorName` gets set to the latest value provided in the last `MyMessage` instance received, and then that value gets printed to the console whenever a `Hi` message type is received.

This is how you should expect to modify your actor's mutable state inside Proto.Actor - by passing stateful messages.

## Messages are immutable

Immutable messages are inherently thread-safe.  No thread can modify the content of an immutable message, so a second thread receiving the original message doesn't have to worry about a previous thread altering the state in an unpredictable way.

Hence, in Proto.Actor - all messages should be immutable and thus thread-safe. That's one of the reasons why we can have thousands of Proto.Actor actors process messages concurrently without synchronization mechanisms - because immutable messages eliminate that as a requirement.

## Message-passing is asynchronous

In OOP, your objects communicate with each-other via function calls. The same is true for procedural programming. Class A calls a function on Class B and waits for that function to return before Class A can move onto the rest of its work.

In the Proto.Actor and the Actor model, actors communicate with each-other by sending messages.

So what's so radical about this idea?

Well for starters, **message passing is asynchronous** - the actor who sent the message can continue to do other work while the receiving actor processes the sender's message.
So in effect, every interaction one actor has with any other actor is going to be asynchronous by default.

That's a dramatic change, but here's another big one...

Since all "function calls" have been replaced by messages, i.e. distinct instances of objects, actors can store a history of their function calls and even defer processing some function calls until later in the future!

Imagine how easy it would be to build something like the Undo button in Microsoft Word with an actor - by default you have a message that represents every change someone made to a document. To undo one of those changes, you just have to pop the message off of the UndoActor's stash of messages and push that change back to another actor who manages the current state of the Word document. This is a pretty powerful concept in practice.

### References

* **[*Reactive Manifesto*: Glossary - Message-driven](http://www.reactivemanifesto.org/glossary#Message-Driven)**
* **[*Wikipedia*: "Immutable object"](http://en.wikipedia.org/wiki/Immutable_object)**
