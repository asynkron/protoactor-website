# Lesson 7: What's an actor in Proto.Actor.

In this lesson, we will learn more about the main features of actors.

The actor model is well-described by one phrase: **Everything is an actor**.

Actors are fundamental, primitive computing units that do all the work in our system and, thus, are the building blocks of our system.

In an application, actors must perform small, well-defined tasks, so our application consists of multiple actors, each performing a strictly defined task ([Single-responsibility principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)). 

Actors being small reduces an application to dividing the task into small subtasks (Decomposition) and implementing these subtasks as separate actors.

Thanks to the Proto.Actor platform, the actor's code looks the same, and actors behave identically, running on local and remote machines.

When you create an actor, you don't get a direct link to it. Instead, You get a PID (short for process ID) - a serializable ID used to send messages to the actor. The advantage of this is that PIDs can be easily serialized and forwarded via messages, allowing actors to communicate remotely.

Sending messages is a critical element in the actors' work. Actors do not directly invoke the methods of another actor. Instead, they send a message to the other actor with instructions to execute a command, allowing them to achieve loose coupling in the system.

Actors are lazy constructs. They sit and only do something if we send them a message. Otherwise, they sit idle.

By and large, there are four basic things an actor can do:

1. Receive and react to messages.
2. Create more actors.
3. Send messages to other actors.
4. Change the state to process the next message.

We will see examples of all these throughout the course.

What is an actor, in essence? Let's look at what an actor consists of:

1. State.
2. Behavior.
3. Mailbox.
4. Child actors.
5. Supervisor strategy.

**State**

The actor usually contains fields that represent its state. This state is the actor's value and must be protected from direct influence by other actors.

One of the concepts of actors in the library is that there is no direct reference to an instance of an actor class - it is impossible to call the method on an actor. The only way to interact between actors is to communicate using asynchronous messages, which we will describe below.

A significant advantage of actors when developing reactive systems is that there is no need to synchronize access to the actor using locks because they are de facto asynchronous. Consequently, the developer writes the logic of the actor's work without worrying about parallelism problems.

Since the state is critical to the actor's actions, the presence of an uncoordinated state is fatal. Thus, if an actor fails and the supervisor restarts it, the actor state is reset to its original state, solving the problem of the actor's fault tolerance by allowing the system to self-recover.

Configuring the actor to automatically restore to the state before restarting is also possible using behavior.

**Behavior**

Behavior is a function that determines the actions to perform in response to a message, such as forwarding a request if the client is authorized, rejecting, etc.

The behavior can change over time, for example, when different clients are authorized overtime or because the actor can go into "no service" mode. The behavior can change according to the actor's state, and you can update it at runtime.

When the actor restarts, its behavior resets to the initial state. However, with the help of configurations, it is possible to automatically restore the actor's behavior to the state before the restart.

**Mailbox**

The purpose of an actor is to process messages sent from other actors inside the system or messages received from external systems. Actor's mailbox connects the sender and recipient: each actor has only one mailbox where senders place messages. Sending messages from the same source to a particular actor will put them in the queue in the same order, no matter whether the actors are running on multiple threads simultaneously.

There are different ways to implement mailboxes. By default, we use FIFO (first-in-first-out): the actor processes messages in the order they were queued. In most cases, FIFO is the best choice, but applications may need to prioritize some messages over others.

The algorithm for placing messages in the mailbox is configurable, and you can queue messages depending on the priority or use a custom algorithm instead of FIFO.

An essential feature in which Proto.Actor differs from other actor model implementations is that the actor's current behavior must always process the next message from the queue. However, out of the box, there is no validation of whether the actor with current behavior can process the received message. Failure to process a message is usually considered a failure.

**Child Actors**
Each actor is potentially a supervisor: if it creates child actors to delegate subtasks, it automatically controls them. An actor can access child actors in its context, though descendants of the second generation are considered "grandchildren" and are not directly accessible. You can create child actors by calling `context.actorOf (...)` or stop them by calling `context.stop (child)`. Creating and terminating child actors is asynchronous and does not block the supervisor.

**Supervisor strategy**
The last part of the actor is the strategy for handling failures in child actors. The standard child actors failure strategies are:

- resume the work of the subordinate actor, keeping its status;
- resume the work of the subordinate actor, restoring its standard state;
- stop the work of a subordinate actor;
- pass the failure up (not recommended and should only be used in exceptional situations).

Since this strategy is crucial for the actor and its child actors, it is immutable after the actor's creation.

Because there is a single strategy for each actor, you can apply different strategies by grouping subordinate actors under intermediate supervisors with corresponding strategies. You can also restructure actors if too many different strategies are needed.

Proto.Actor is asynchronous, non-blocking, and supports message exchange. It is scalable vertically as well as horizontally.

To support fault tolerance, it has tracking mechanisms and meets all the requirements for creating reactive systems.

[Go ahead!](../lesson-8)
