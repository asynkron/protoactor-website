---
title: "What is Proto.Actor?"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# What is Proto.Actor?
Proto.Actor is a **Next generation Actor Model framework**.

Over the last few years we have seen two competing approaches of actors emerging.
First we have the classical Erlang/Akka style actors, and later came the Microsoft Orleans style *"virtual actors"* or *"Grains"*.
These two ways both yield different benefits and drawbacks.

Proto.Actor unifies both of these two ways of working under a common framework.

Proto.Actor solves another major issue, none of the pre-existing actor model frameworks or languages can communicate between platforms.
Picking one of the old ways of working with actors, you are locked into a specific platform.

This is why Proto.Actor introduces "Actor Standard Protocol", a predefined contract of base primitives which can be consumed by different language implementations.
This is a game changer in the field of actor systems, **you are now free to pick and choose languages for your different actor based microservices in a way never seen before.**

## Relation to Microsoft Orleans
Proto.Actor is based on the same conceptual distributed hash table and automatic placement strategies as Microsoft Orleans.
The cluster Grains are also similar in the sense that they use an RPC based interface.
The virtual actor model has proven to be very successful and is here to stay.
We are fully embracing this concept.

Read more {{< link "Grains" "grains.md" >}}

## Relation To Akka and Akka.NET
The core parts of Proto.Actor loosely follow the conceptual API of Akka.

Proto.Actor was created by Roger Johansson, the original creator of Akka.NET.
The reason for creating yet another actor model framework was due to the many design issues faced while building Akka.NET.
Akka.NET required the team to build custom thread pools, custom network layers, custom serialization, custom configuration support and much more.
All interesting topics on their own, but yield a huge cost in terms of development and maintenance hours.

Proto.Actor focuses on only solving the actual problems at hand, concurrency and distributed programming by reusing existing proven building blocks for all the
secondary aspects.

Proto.Actor uses Protobuf for serialization, a decision that vastly simplifies the way Proto.Actor works.
Message based systems should be about passing information, not passing complex OOP object graphs or code.

Proto.Actor also uses gRPC, leveraging HTTP/2 streams for network communication.

## Scalable, distributed real-time transaction processing
We believe that writing correct, concurrent, fault-tolerant and scalable applications is too hard.

Most of the time, that's because we are using the wrong tools and the wrong level of abstraction. Proto.Actor is here to change that.

By using the Actor Model, we raise the abstraction level and provide a better platform to build scalable, resilient and responsive applications—see the [Reactive Manifesto](http://www.reactivemanifesto.org/) for more details.

For fault-tolerance we adopt the "let it crash" model, which the telecom industry has used with great success to build applications that self-heal and systems that never stop. Actors also provide the abstraction for transparent distribution and the basis for truly scalable and fault-tolerant applications.

Proto.Actor is Open Source and available under the [Apache 2 License](http://www.apache.org/licenses/LICENSE-2.0) -- [explained in plain english here](https://www.tldrlegal.com/l/apache2).

Download from https://github.com/AsynkronIT/protoactor-go.

## A unique hybrid

### Actors
* Simple and high-level abstractions for concurrency and parallelism.
* Asynchronous, non-blocking and highly performant event-driven programming model.
* Very lightweight event-driven processes (several million actors per GB of heap memory).

## Virtual Actors aka. Grains
* Easy to use RPC based abstraction for friction-free distributed programming.

### Fault Tolerance
* Supervisor hierarchies with "let it crash" semantics.
* Supervisor hierarchies can span over multiple virtual machines to provide truly fault-tolerant systems.
* Excellent for writing highly fault-tolerant systems that self-heal and never stop.
See [Fault Tolerance](fault-tolerance.md).

### Location Transparency
Everything in Proto.Actor is designed to work in a distributed environment: all interactions of actors use pure message passing and everything is asynchronous.
