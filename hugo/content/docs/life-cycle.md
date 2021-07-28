---
layout: docs.hbs
title: Actor Lifecycle
---

# Actor Lifecycle

<img src="../images/LifeCycle-blue.png" style="max-height:400px;margin-bottom:20px;margin-left:20px">

<!-- Todo: Document which system messages can be handled by an actor. Started/Stopping/Restarting... -->

After an actor has been spawned, it goes through a lifecycle involving a number of possible states and actions. In the most basic case, a spawned actor is first created, or "incarnated", sent a `Started` message and will keep running until the application shuts down. There are however a few circumstances under which the lifecycle will be different.

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
- `Stopped` is sent when an actor has stopped and the actor and it's related objects detached from the system. At this stage the actor can no longer send or receive any messages, and after the message has been processed the objects will be up for garbage collection.

## Flow diagram

<img src="../images/actorlifecycle.png" style="width:50%">
