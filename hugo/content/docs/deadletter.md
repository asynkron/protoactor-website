---
title: Dead Letters
---

# Dead Letters

Messages which cannot be delivered (and for which this can be ascertained) will be delivered to a synthetic actor are called DeadLetters. This delivery happens on a best-effort basis; it may fail even within the local process (e.g. during actor termination). Messages sent via unreliable network transports will be lost without turning up as dead letters.

## What should I use Dead Letters for?

The main use of this facility is for debugging, especially if an actor send does not arrive consistently (where usually inspecting the dead letters will tell you that the sender or recipient was set wrong somewhere along the way). In order to be useful for this purpose it is good practice to avoid sending to deadLetters where possible, i.e. run your application with a suitable dead letter logger (see more below) from time to time and clean up the log output. This exercise—like all else—requires judicious application of common sense: it may well be that avoiding to send to a terminated actor complicates the sender’s code more than is gained in debug output clarity.

The dead letter service follows the same rules with respect to delivery guarantees as all other message sends, hence it cannot be used to implement guaranteed delivery.

## How do I receive Dead Letters?

An actor can subscribe to type DeadLetter on the event stream, see `EventStream` for how to do that. The subscribed actor will then receive all dead letters published in the (local) system from that point onwards. Dead letters are not propagated over the network, if you want to collect them in one place you will have to subscribe one actor per network node and forward them manually. Also consider that dead letters are generated at that node which can determine that a send operation is failed, which for a remote send can be the local system (if no network connection can be established) or the remote one (if the actor you are sending to does not exist at that point in time).

## Dead Letters which are (usually) not worrisome

Every time an actor does not terminate by its own decision, there is a chance that some messages which it sends to itself are lost. There is one which happens quite easily in complex shutdown scenarios that is usually benign: `Stop` message dropped means that two stop requests were given, but of course only one can succeed. In the same vein, you might see `Stop` messages from children while stopping a hierarchy of actors turning up in dead letters if the parent is still watching the child when the parent terminates.
