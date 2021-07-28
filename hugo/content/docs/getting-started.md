---
layout: docs.hbs
title: Getting started
---

# Getting started with Proto.Actor

This tutorial is intended to give an introduction to using Proto.Actor by creating a simple greeter actor using C#.

<img src="../images/Getting-Started-all-blue.png" style="max-height:400px;margin-bottom:20px;margin-left:20px">

## Set up your project

First, we need to start Visual Studio and create a new C# Console Application. Once we have our console application, we need to install Proto.Actor package. In order to do this open up the Package Manager Console and type:

```PM
PM> Install-Package Proto.Actor
```

Then we need to add ```using Proto.Actor``` statement:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//Add these two lines
using Proto.Actor;

namespace ConsoleApplication11
{
    class Program
    {
        static void Main(string[] args)
        {
        }
    }
}
```

## Create your first actor

First, let's create a class `Greet`. This class is the message type that will be sent to the actor and that the actor will respond. The instance of the message class must be immutable. You can read more about what messages are in Proto.Actor [here](https://proto.actor/docs/bootcamp/unit-1/lesson-8/). 
In the class `Greet`, we create the property `Who`, which has a public getter and a private setter. The property will be set in the constructor when creating an instance of the class. This way we can guarantee that the `Who` property will not change after the creation of the instance of class `Greet`.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Proto.Actor;

namespace ConsoleApplication11
{
    // Create an (immutable) message type that your actor will respond to
    public class Greet
    {
        public Greet(string who)
        {
            Who = who;
        }
        public string Who { get;private set; }
    }

    class Program
    {
        static void Main(string[] args)
        {
        }
    }
}
```

Once we have the message type, we can create our actor. To do this, we create class `GreetingActor` that inherits from the `IActor` interface. In this class, we need to implement an asynchronous method `ReceiveAsync` that has `IContext` parameter. If the incoming `IContext` contains a message of the `Greet` type, then we need to respond to it. Otherwise, no action is required.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Proto.Actor;

namespace ConsoleApplication11
{
    public class Greet
    {
        public Greet(string who)
        {
            Who = who;
        }
        public string Who { get;private set; }
    }

    // Create the actor class
    public class GreetingActor : IActor
    {
        public Task ReceiveAsync(IContext ctx)
        {
            if (ctx.Message is Greet)
            {
                // Tell the actor to respond
                // to the Greet message
                var greet = (Greet)ctx.Message;
                Console.WriteLine("Hello {0}", greet.Who));
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
        }
    }
}
```

Now it's time to consume our actor, we do so by calling `Spawn`. First, let's create `Props` that determine how the actor will be created. Read more about [what Prop is](https://proto.actor/docs/props/). Then spawn the actor using created `Props` and send a message of `Greet` type to it.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Proto;

namespace ConsoleApplication11
{
    public class Greet
    {
        public Greet(string who)
        {
            Who = who;
        }
        public string Who { get;private set; }
    }

    // Create the actor class
    public class GreetingActor : IActor
    {
        public Task ReceiveAsync(IContext ctx)
        {
            if (ctx.Message is Greet)
            {
                // Tell the actor to respond
                // to the Greet message
                var greet = (Greet)ctx.Message;
                Console.WriteLine("Hello {0}", greet.Who));
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var system = new ActorSystem();
            var props = Props.FromProducer(() => new GreetingActor());
            var greeter = system.Root.Spawn(props);

            // Send a message to the actor
            system.Root.Send(new Greet("World"));

            // This prevents the app from exiting
            // before the async work is done
            Console.ReadLine();
        }
    }
}
```

That is it, your actor is now ready to consume messages sent from any number of calling threads.
