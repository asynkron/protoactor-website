---
title: "Fault Tolerance"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---
# Fault Tolerance

Each actor is the supervisor of its children, and as such each actor defines fault handling supervisor strategy.
This strategy cannot be changed afterwards as it is an integral part of the
actor system's structure.

## Fault Handling in Practice

First, let us look at a sample that illustrates one way to handle data store errors,
which is a typical source of failure in real world applications. Of course it depends
on the actual application what is possible to do when the data store is unavailable,
but in this sample we use a best effort re-connect approach.

Read the following source code. The inlined comments explain the different pieces of
the fault handling and why they are added. It is also highly recommended to run this
sample as it is easy to follow the log output to understand what is happening in runtime.

!!!TODO: Port sample code

## Creating a Supervisor Strategy

The following sections explain the fault handling mechanism and alternatives
in more depth.

For the sake of demonstration let us consider the following strategy:

!!!TODO: Port sample code

We have chosen a few well-known exception types in order to demonstrate the
application of the fault handling directives described in [Supervision](supervision.md).
First off, it is a one-for-one strategy, meaning that each child is treated
separately (an all-for-one strategy works very similarly, the only difference
is that any decision is applied to all children of the supervisor, not only the
failing one). There are limits set on the restart frequency, namely maximum 10
restarts per minute; each of these settings could be left out, which means
that the respective limit does not apply, leaving the possibility to specify an
absolute upper limit on the restarts or to make the restarts work infinitely.
The child actor is stopped if the limit is exceeded.

This is the piece which maps child failure types to their corresponding directives.

{{< note >}}
If the strategy is declared inside the supervising actor (as opposed to
within a companion object) its decider has access to all internal state of
the actor in a thread-safe fashion, including obtaining a reference to the
currently failed child (available as the ``sender`` of the failure message).
{{</ note >}}

### Default Supervisor Strategy

`Escalate` is used if the defined strategy doesn't cover the exception that was thrown.

When the supervisor strategy is not defined for an actor the following
exceptions are handled by default:

* `ActorInitializationException` will stop the failing child actor
* `ActorKilledException` will stop the failing child actor
* `Exception` will restart the failing child actor
* Other types of `Exception` will be escalated to parent actor

If the exception escalate all the way up to the root guardian it will handle it
in the same way as the default strategy defined above.

You can combine your own strategy with the default strategy:

### Logging of Actor Failures

By default the `SupervisorStrategy` logs failures unless they are escalated.
Escalated failures are supposed to be handled, and potentially logged, at a level
higher in the hierarchy.

You can mute the default logging of a `SupervisorStrategy` by setting
`loggingEnabled` to `false` when instantiating it. Customized logging
can be done inside the `Decider`. Note that the reference to the currently
failed child is available as the `Sender` when the `SupervisorStrategy` is
declared inside the supervising actor.

You may also customize the logging in your own ``SupervisorStrategy`` implementation
by overriding the `logFailure` method.

## Supervision of Top-Level Actors

Top-level actors means those which are created using `actor.Spawn()`, and
they are children of the [Root Guardian](root-guardian.md). There are no
special rules applied in this case, the guardian simply applies the configured
strategy.

The supervisor itself is supervised by the top-level actor provided by the
`ActorSystem`, which has the default policy to restart in case of all
`Exception` cases (with the notable exceptions of
`ActorInitializationException` and `ActorKilledException`). Since the
default directive in case of a restart is to kill all children, we expected our poor
child not to survive this failure.

In case this is not desired (which depends on the use case), we need to use a
different supervisor which overrides this behavior.
