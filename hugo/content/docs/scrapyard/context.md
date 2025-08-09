# Lesson 9: What Are Props, RootContext, and ActorContext in Proto.Actor

Now that we know what actors and messages are, let's look at the actor's context.

Actors do not exist in isolation; they require context. Context is the infrastructure needed to create and run actors.

In Proto.Actor, there are two types of context: RootContext and ActorContext.

### RootContext

It is used for the initial creation of actors and for interacting with them within our system.

### ActorContext

Unlike RootContext, which is a single instance for the entire application, ActorContext is created individually for each actor. Like RootContext, it is used to generate child actors and interact with other actors, but it also stores additional information needed for that actor instance to function, such as its child actor list or the message being processed.

We will review the methods contained in RootContext and ActorContext in more detail during our course. 

### Props

This configuration class allows you to set parameters for creating actors. It includes related information such as which task scheduler or mailbox to use.

[Go ahead!](../lesson-10)
