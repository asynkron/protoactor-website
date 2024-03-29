---
title: "Durability"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Message Delivery Reliability

Proto.Actor helps you build reliable applications which make use of multiple processor
cores in one machine (“scaling up”) or distributed across a computer network
(“scaling out”). The key abstraction to make this work is that all interactions
between your code units—actors—happen via message passing, which is why the
precise semantics of how messages are passed between actors deserve their own
chapter.

In order to give some context to the discussion below, consider an application
which spans multiple network hosts. The basic mechanism for communication is
the same whether sending to an actor on the local application or to a remote actor, but
of course there will be observable differences in the latency of delivery
(possibly also depending on the bandwidth of the network link and the message
size) and the reliability. In case of a remote message send there are obviously
more steps involved which means that more can go wrong. Another aspect is that
local sending will just pass a reference to the message inside the same application,
without any restrictions on the underlying object which is sent, whereas a
remote transport will place a limit on the message size.

Writing your actors such that every interaction could possibly be remote is the
safe, pessimistic bet. It means to only rely on those properties which are
always guaranteed and which are discussed in detail below.  This has of course
some overhead in the actor's implementation. If you are willing to sacrifice full
location transparency—for example in case of a group of closely collaborating
actors—you can place them always on the same local application and enjoy stricter guarantees
on message delivery. The details of this trade-off are discussed further below.

As a supplementary part we give a few pointers at how to build stronger
reliability on top of the built-in ones. The chapter closes by discussing the
role of the “Dead Letter Office”.

## The General Rules

These are the rules for message sends (i.e. the `Send`  method, which
also underlies the `Request` pattern):

* **at-most-once delivery**, i.e. no guaranteed delivery
* **message ordering per sender–receiver pair**

The first rule is typically found also in other actor implementations while the
second is specific to Proto.Actor.

## Discussion: What does “at-most-once” mean?

When it comes to describing the semantics of a delivery mechanism, there are
three basic categories:

* **at-most-once** delivery means that for each message handed to the
  mechanism, that message is delivered zero or one times; in more casual terms
  it means that messages may be lost.

* **at-least-once** delivery means that for each message handed to the
  mechanism potentially multiple attempts are made at delivering it, such that
  at least one succeeds; again, in more casual terms this means that messages
  may be duplicated but not lost.

* **exactly-once** delivery means that for each message handed to the mechanism
  exactly one delivery is made to the recipient; the message can neither be
  lost nor duplicated.

The first one is the cheapest with the highest performance, also with the least implementation
overhead, because it can be done in a fire-and-forget fashion without keeping
state at the sending end or in the transport mechanism. The second one requires
retries to counter transport losses, which means keeping state at the sending
end and having an acknowledgement mechanism at the receiving end. The third is
most expensive—and has consequently the worst performance—because in addition to
the second it requires state to be kept at the receiving end in order to filter
out duplicate deliveries.

## Discussion: Why No Guaranteed Delivery?

At the core of the problem lies the question of what exactly this guarantee shall
mean:

1. The message is sent out on the network?
2. The message is received by the other host?
3. The message is put into the target actor's mailbox?
4. The message is starting to be processed by the target actor?
5. The message is processed successfully by the target actor?

Each one of these have different challenges and costs, and it is obvious that
there are conditions under which any message passing library would be unable to
comply; think for example about configurable mailbox types and how a bounded
mailbox would interact with the third point, or even what it would mean to
decide upon the “successfully” part of point five.

Along those same lines goes the reasoning in [Nobody Needs Reliable
Messaging](https://medium.com/@kellerapps/nobody-needs-reliable-messaging-7012ab5c5b18). The only meaningful way for a sender to know whether an
interaction was successful is by receiving a business-level acknowledgement
message, which is not something Proto.Actor could make up on its own (neither are we
writing a “do what I mean” framework nor would you want us to).

Proto.Actor embraces distributed computing and makes the fallibility of communication
explicit through message passing, therefore it does not try to lie and emulate
a leaky abstraction. This is a model that has been used with great success in
Erlang and requires the users to design their applications around it. You can
read more about this approach in the [Erlang documentation](http://erlang.org/faq/academic.html#idp32880720), Proto.Actor follows it closely.

Another angle on this issue is that by providing only basic guarantees those
use cases which do not need stronger reliability do not pay the cost of their
implementation; it is always possible to add stronger reliability on top of
basic ones, but it is not possible to retro-actively remove reliability in order
to gain more performance.

## Discussion: Message Ordering

The rule more specifically is that *for a given pair of actors, messages sent
from the first to the second will not be received out-of-order.* This is
illustrated in the following:

  Actor `A1` sends messages `M1`, `M2`, `M3` to `A2`

  Actor `A3` sends messages `M4`, `M5`, `M6` to `A2`

  This means that:
      1) If `M1` is delivered it must be delivered before `M2` and `M3`
      2) If `M2` is delivered it must be delivered before `M3`
      3) If `M4` is delivered it must be delivered before `M5` and `M6`
      4) If `M5` is delivered it must be delivered before `M6`
      5) `A2` can see messages from `A1` interleaved with messages from `A3`
      6) Since there is no guaranteed delivery, any of the messages may be dropped, i.e. not arrive at `A2`

{{< note >}}
It is important to note that Proto.Actor's guarantee applies to the order in which
messages are enqueued into the recipient's mailbox. 
{{</ note >}}

Please note that this rule is **not transitive**:

  Actor `A` sends message `M1` to actor `C`

  Actor `A` then sends message `M2` to actor `B`

  Actor `B` forwards message `M2` to actor `C`

  Actor `C` may receive `M1` and `M2` in any order

Causal transitive ordering would imply that `M2` is never received before
`M1` at actor `C` (though any of them might be lost). This ordering can be
violated due to different message delivery latencies when `A`, `B` and
`C` reside on different network hosts, see more below.

{{< note >}}
Actor creation is treated as a message sent from the parent to the child,
with the same semantics as discussed above. Sending a message to an actor in
a way which could be reordered with this initial creation message means that
the message might not arrive because the actor does not exist yet. An example
where the message might arrive too early would be to create a remote-spawned
actor R1, send its reference to another remote actor R2 and have R2 send a
message to R1. An example of well-defined ordering is a parent which creates
an actor and immediately sends a message to it.
{{</ note >}}

### Communication of failure

Please note, that the ordering guarantees discussed above only hold for user messages between actors. Failure of a child
of an actor is communicated by special system messages that are not ordered relative to ordinary user messages. In
particular:

  Child actor `C` sends message `M` to its parent `P`

  Child actor fails with failure `F`

  Parent actor `P` might receive the two events either in order `M`, `F` or `F`, `M`

The reason for this is that internal system messages has their own mailboxes therefore the ordering of enqueue calls of
a user and system message cannot guarantee the ordering of their dequeue times.

## The rules for In-App (local) message sends

### Be careful what you do with this section!

Relying on the stronger reliability in this section is not recommended since it
will bind your application to local-only deployment: an application may have to
be designed differently (as opposed to just employing some message exchange
patterns local to some actors) in order to be fit for running on a cluster of
machines. Our credo is “design once, deploy any way you wish”, and to achieve
this you should only rely on The [General Rules]().

### Reliability of local message sends

The Proto.Actor test suite relies on not losing messages in the local context (and for
non-error condition tests also for remote spawning), meaning that we
actually do apply the best effort to keep our tests stable. A local `Send`
operation can however fail for the same reasons as a normal method call can on
the CLR:

- `StackOverflowException`
- `OutOfMemoryException`
- other :`SystemException`

In addition, local sends can fail in ProtoActor-specific ways:

- if the mailbox does not accept the message (e.g. full `BoundedMailbox`)
- if the receiving actor fails while processing the message or is already
  terminated

While the first is clearly a matter of configuration the second deserves some
thought: the sender of a message does not get feedback if there was an
exception while processing, that notification goes to the supervisor instead.
This is in general not distinguishable from a lost message for an outside
observer.

### Ordering of local message sends

Assuming strict FIFO mailboxes the aforementioned caveat of non-transitivity of
the message ordering guarantee is eliminated under certain conditions. As you
will note, these are quite subtle as it stands, and it is even possible that
future performance optimizations will invalidate this whole paragraph. The
possibly non-exhaustive list of counter-indications is:

- Before receiving the first reply from a top-level actor, there is a lock
  which protects an internal interim queue, and this lock is not fair; the
  implication is that enqueue requests from different senders which arrive
  during the actor's construction (figuratively, the details are more involved)
  may be reordered depending on low-level thread scheduling. Since completely
  fair locks do not exist on the CLR this is unfixable.

- The same mechanism is used during the construction of a Router, more
  precisely the routed ActorRef, hence the same problem exists for actors
  deployed with Routers.

- As mentioned above, the problem occurs anywhere a lock is involved during
  enqueueing, which may also apply to custom mailboxes.

This list has been compiled carefully, but other problematic scenarios may have
escaped our analysis.

### How does Local Ordering relate to Network Ordering

As explained in the previous paragraph local message sends obey transitive causal ordering under certain conditions. If the remote message transport would respect this ordering as well, that would translate to transitive causal ordering across one network link, i.e. if exactly two network hosts are involved. Involving multiple links, e.g. the three actors on three different nodes mentioned above, then no guarantees can be made.

The current remote transport does **not** support this (again this is caused by non-FIFO wake-up order of a lock, this time serializing connection establishment).

As a speculative view into the future it might be possible to support this ordering guarantee by re-implementing the remote transport layer based completely on actors; at the same time we are looking into providing other low-level transport protocols like UDP or SCTP which would enable higher throughput or lower latency by removing this guarantee again, which would mean that choosing between different implementations would allow trading guarantees versus performance.

## Higher-level abstractions

Based on a small and consistent tool set in ProtoActor's core, Proto.Actor also provides
powerful, higher-level abstractions on top it.

### Messaging patterns

As discussed above a straight-forward answer to the requirement of reliable
delivery is an explicit ACK–RETRY protocol. In its simplest form this requires

- a way to identify individual messages to correlate message with
  acknowledgement
- a retry mechanism which will resend messages if not acknowledged in time
- a way for the receiver to detect and discard duplicates

The third becomes necessary by virtue of the acknowledgements not being guaranteed
to arrive either. An ACK-RETRY protocol with business-level acknowledgements is
supported by [[At least once delivery]] of the Proto.Actor Persistence module. Duplicates can be
detected by tracking the identifiers of messages sent via [[At least once delivery]].
Another way of implementing the third part would be to make processing the messages
idempotent on the level of the business logic.

Another example of implementing all three requirements is shown at
:ref:`reliable-proxy` (which is now superseded by [[At least once delivery]]).

### Event Sourcing

Event sourcing (and sharding) is what makes large websites scale to
billions of users, and the idea is quite simple: when a component (think actor)
processes a command it will generate a list of events representing the effect
of the command. These events are stored in addition to being applied to the
component's state. The nice thing about this scheme is that events only ever
are appended to the storage, nothing is ever mutated; this enables perfect
replication and scaling of consumers of this event stream (i.e. other
components may consume the event stream as a means to replicate the component's
state on a different continent or to react to changes). If the component's
state is lost—due to a machine failure or by being pushed out of a cache—it can
easily be reconstructed by replaying the event stream (usually employing
snapshots to speed up the process). :ref:`event-sourcing` is supported by
Proto.Actor Persistence.

### Mailbox with Explicit Acknowledgement

By implementing a custom mailbox type it is possible retry message processing
at the receiving actor's end in order to handle temporary failures. This
pattern is mostly useful in the local communication context where delivery
guarantees are otherwise sufficient to fulfill the application's requirements.

Please note that the caveats for `The Rules for In-App (Local) Message Sends`_
do apply.

An example implementation of this pattern is shown at :ref:`mailbox-acking`.

## Dead Letters

Messages which cannot be delivered are called `DeadLetters`. 

Read more about DeadLetter messages in a [dedicated article](deadletter.md).


.. _Erlang documentation: http://www.erlang.org/faq/academic.html
.. _Nobody Needs Reliable Messaging: http://www.infoq.com/articles/no-reliable-messaging
