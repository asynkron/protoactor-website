# Lesson 9: What are Props, RootContext, and ActorContext in Proto.Actor?

Our actors do not exist by themselves. They need a certain context. Context is the infrastructure required to create and run actors.

In Proto.Actor, there are two types of context: RootContext and ActorContext.

### RootContext

RootContext is used for the initial creation of the actor and interaction with actors in our system. 

### ActorContext

Unlike RootContext, which has a single instance created for the entire application, ActorContext is created individually for each actor.
Like RootContext, ActorContext is used to generate child actors and interact with other actors. But ActorContext also stores additional information necessary for a particular actor instance to function, such as a list of child actors or a message we have received for processing.

During our course, we will review the methods in RootContext and ActorContext in more detail. 

### Props

Props is a configuration class that allows you to set parameters for creating actors, such as defining which Task Manager or mailbox to use.

[Go ahead!](../lesson-10)