---
layout: docs.hbs
title: The Obligatory Hello World
---
#  The Obligatory Hello World
This example shows how to define and consume actors.

## Hello World 

### Define a message

The first thing we do, is to define a message.
A message is an object that represents some form of information the actor can act upon.
There are two flavors of messages, plain object/struct messages, or Protobuf messages.
Read more on Protobuf messages here: ...

{{< tabs >}}
{{< tab "C#" >}}
```csharp
// define a POCO message
class Hello
{
    public string Who;
}
```
{{</ tab >}}
{{< tab "Go" >}}
```go
// define a struct for our message
type Hello struct{ Who string }
```
{{</ tab >}}
{{</ tabs >}}

### Define your actor

Now let's define the actor, from a technical point of view, you can think of an actor as an asynchronous worker.

The actor is a type, that follows a specific interface, the actor interface.
This interface receives a `Context`, this context contains information about the actor internals.
In this case, we are interested in acting upon the message the actor received.

{{< tabs >}}
{{< tab "C#" >}}
```csharp
//the actor type, owner of any actor related state
class HelloActor : IActor
{
    //the receive function, invoked by the runtime whenever a message
    //should be processed
    public Task ReceiveAsync(IContext context)
    {
        //the message we received
        var msg = context.Message; 
        //match message based on type
        if (msg is Hello msg)
        {
            Console.WriteLine($"Hello {msg.Who}");
        }
        return Actor.Done;
    }
}
```
{{</ tab >}}
{{< tab "Go" >}}
```go
//the actor type, owner of any actor related state
type helloActor struct{}

//the receive function, invoked by the runtime whenever a message
//should be processed
func (state *HelloActor) Receive(context actor.Context) {
    //the message we received
    switch msg := context.Message().(type) {
    //match message based on type
    case Hello:
        fmt.Printf("Hello %v\n", msg.Who)
    }
}
```
{{</ tab >}}
{{</ tabs >}}

### Usage

Once we have both the message and actor, we can now hook everything up and send our first message to an actor.

{{< tabs >}}
{{< tab "C#" >}}
```csharp
var system = new ActorSystem();

//the actor configuration
var props = Props.FromProducer(() => new HelloActor());

//instantiate the actor
var pid = system.Root.Spawn(props);

//send a message to the actor
system.Root.Send(new Hello
{
    Who = "Alex"
});
```
{{</ tab >}}
{{< tab "Go" >}}
```go
//the actor configuration
props := actor.FromInstance(&HelloActor{})

//instantiate the actor
pid := actor.Spawn(props)

//send a message to the actor
pid.Send(Hello{Who: "Roger"})
```
{{</ tab >}}
{{</ tabs >}}