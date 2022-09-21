---
layout: docs.hbs
title: Middleware
---

# Middleware

When creating an actor, you can inject middleware to intercept incoming and outgoing messages (Receive and Sender middleware, respectively). This is done via two extension points on the Props:

## Receive middleware

Receive middleware intercepts incoming messages. It is injected using the `Props.WithReceiveMiddleware()` method. Each middleware will be invoked in the order they were passed, and is responsible for invoking the next middleware.

A receive middleware consists of a method/delegate which takes a `Receive` argument, which is the next middleware to invoke and returns a `Receive` method. Together, the middlewares and the actor's `Receive` method form a chain, where each middleware should call the next and return its result. The signature of a receive middleware is `Func<Receive, Receive>`.

### Example

```csharp
var props = Actor.FromFunc(c => {
        Console.WriteLine("actor");
        return Task.CompletedTask;
    })
    .WithReceiveMiddleware(
        next => async context =>
        {
            Console.WriteLine("middleware 1");
            await next(context); // invokes the second middleware
        },
        next => async context =>
        {
            Console.WriteLine("middleware 2");
            await next(context); // invokes the actor
        })
    );

```

The above code will print `middleware 1`, then `middleware 2`, then `actor`. The `next` argument to the first middleware will be the second middleware, and the `next` argument to the second middleware will be the actor's `Receive` method.

## Sender middleware

Sender middleware intercepts outgoing messages sent via the `Context`. It is setup using the `Props.WithSenderMiddleware()` method. Like receive middlewares, the sender middlewares form a chain where each middleware calls the next. The signature of a sender middleware is `Func<Sender, Sender>`.

A difference for sender middleware is that the message is wrapped in a `MessageEnvelope` containing the message, the sender and a message header. The main purpose of this is to enable adding contextual metadata to the headers, that can then be propagated to remote actors.

### Example

```csharp
var props = Actor.FromFunc(c => {
        Console.WriteLine("actor");
        return Task.CompletedTask;
    })
    .WithSenderMiddleware(
        next => async (context, target, envelope) =>
        {
            Console.WriteLine("middleware 1");
            await next(context, target, envelope); // invokes the second middleware
        },
        next => async (c, target, envelope) =>
        {
            Console.WriteLine("middleware 2");
            await next(context, target, envelope); // sends the message to the target
        }
    );

```

The above code will print `actor`, then `middleware 1`, then `middleware 2`. The `next` argument to the first middleware will be the second middleware, and the `next` argument to the second middleware.
