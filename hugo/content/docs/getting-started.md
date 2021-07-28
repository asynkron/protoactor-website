---
layout: docs.hbs
title: Getting started
---

# Getting started with Proto.Actor

This tutorial is intended to give an introduction to using Proto.Actor by creating a simple greeter actor using C#.

<img src="../images/Getting-Started-all-blue.png" style="max-height:400px;margin-bottom:20px;margin-left:20px">

## Set up your project

Start visual studio and create a new C# Console Application.
Once we have our console application, we need to open up the Package Manager Console and type:

```PM
PM> Install-Package Proto.Actor
```

Then we need to add the relevant using statements:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//Add these two lines
using Proto;

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

First, we need to create a message type that our actor will respond to:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Proto;

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

Once we have the message type, we can create our actor:

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
            if (ctx.Message is Greet greet)
            {
                // Tell the actor to respond
                // to the Greet message
                Console.WriteLine("Hello {0}", greet.Who)); 
            }
            return Task.CompletedTask;
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

Now it's time to consume our actor, we do so by calling `Spawn`

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
            if (ctx.Message is Greet greet)
            {
                // Tell the actor to respond
                // to the Greet message
                Console.WriteLine("Hello {0}", greet.Who)); 
            }
            return Task.CompletedTask;
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
            system.Root.Send(greeter, new Greet("World"));

            // This prevents the app from exiting
            // before the async work is done
            Console.ReadLine();
        }
    }
}
```

That is it, your actor is now ready to consume messages sent from any number of calling threads.
