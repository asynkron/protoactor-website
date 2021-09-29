---
title: Proto.Actor Bootcamp
date: 2020-07-2614
layout: article
tags: [protoactor, bootcamp, dotnet, series]
author: Valentin Miroshnichenko
authorimage: "/docs/images/authors/anon.png"
authorsite: "https://github.com/Valentin-Miroshnichenko"
backgroundimage: "/docs/images/backgrounds/bootcamp.png"
---

# Proto.Actor Bootcamp

{{< bootcamp >}}

Welcome to [Proto.Actor](http://proto.actor/) Bootcamp. It is a free course for self-study.

This training course consists of nine main parts, during which you will learn how to create fully functional, real-world programs using Proto.Actor actors and many other components of the Proto.Actor Framework.

We will start with the basics of actors and gradually approach more complex examples.

This course is for self-study — you can do it at any pace you like.

### What will you learn from this course

In this course, you will learn how to use Proto.Actor Framework to create reactive, parallel systems. You will learn how to develop applications that seemed impossible or very complicated before learning Proto.Actor Flamework. After this course, you will feel more confident in solving large and complex tasks.

### Module 1: Introduction to Actor Model and Proto.Actor

In the first module, we will give the basic definitions of the actor model and the Proto.Actor Framework:

1. [Why use the actor model.](unit-1/lesson-1)
2. [Types of applications for which actors are suitable.](unit-1/lesson-2)
3. [Use of Proto.Actor in different types of applications.](unit-1/lesson-3)
4. [The Reactive Manifesto](unit-1/lesson-4)
5. [Key features of the Proto.Actor.](unit-1/lesson-5)
6. [Actors and messages.](unit-1/lesson-6)
7. [What's an actor in Proto.Actor.](unit-1/lesson-7)
8. [What's a message in Proto.Actor.](unit-1/lesson-8)
9. [What're Props, RootContext, and ActorContext in Proto.Actor.](unit-1/lesson-9)
10. [Overview of the supervisor hierarchy in Proto. Actor.](unit-1/lesson-10)
11. [Installing Proto.Actor.](unit-1/lesson-11)

### Module 2 Defining and using actors and messages.

In the previous module, we learned the basic concepts of the actors model and messages. In this chapter, we will study these concepts in more detail. You will learn how to use actors and messages in your applications.:

1. [Defining Actors.](unit-2/lesson-1)
2. [Actor References.](unit-2/lesson-2)
3. [Defining Messages.](unit-2/lesson-3)
4. [Types of Message Sending.](unit-2/lesson-4)
5. [Actor Instantiation.](unit-2/lesson-5)
6. [Defining Which Messages an Actor will processing.](unit-2/lesson-6)
7. [Sending a Custom Message.](unit-2/lesson-7)

### Module 3 Understanding Actor Lifecycles and states.

From this module, you will learn about the actors' life cycle, and also the internal state of the actor.

1. [Actor Lifecycle.](unit-3/lesson-1)
2. [Actor Lifecycle Messages.](unit-3/lesson-2)
3. [Terminating Actors and Hierarchy of Actors](unit-3/lesson-3)
4. [What is the Poison Pill message and how to work with it..](unit-3/lesson-4)
5. [Switchable Actor Behavior](unit-3/lesson-5)
6. [Refactoring with using behavior switching .](unit-3/lesson-6)

### Module 4 Creating actor hierarchy and error handling.

In this module, you will learn how to create a self-recovering system.

1. [Supervisor and actor hierarchy.](unit-4/lesson-1)
2. [Overview of the application that demonstrates the supervisor's capabilities and the actors hierarchy.](unit-4/lesson-2)
3. [Actor's address and PID.](unit-4/lesson-3)
4. [Creating UserCoordinatorActor.](unit-4/lesson-4)
5. [Creating MoviePlayCounterActor.](unit-4/lesson-5)
6. [How parent actors are watching over their children actors.](unit-4/lesson-6)
7. [Strategies to control the state of children's actors.](unit-4/lesson-7)

### Module 5 Message Routing

In this part of our course, you will learn how to quickly and easily solve the scalability problem in your application with routers.

1. [Router pattern.](unit-5/lesson-1)
2. [Load balancing with Proto.Actor routers.](unit-5/lesson-2)
3. [Pool Router.](unit-5/lesson-3)
4. [Group Router.](unit-5/lesson-4)
5. [ConsistentHashing Router.](unit-5/lesson-5)
6. [Implementation of the router pattern with using actors.](unit-5/lesson-6)

### Module 6 Message channels

In this module, you will learn about the different types of channels that used to send messages between actors.

1. [Channels Types.](unit-6/lesson-1)
2. [Point-to-point Channel.](unit-6/lesson-2)
3. [Publisher/Subscriber Channel.](unit-6/lesson-3)
4. [EventStream.](unit-6/lesson-4)
5. [DeadLetter Channel.](unit-6/lesson-5)
6. [Guaranteed delivery.](unit-6/lesson-6)

### Module 7 Proto.Actor Remote

Here we will see how to create a distributed application that runs on multiple computers or virtual machines. You'll see how Proto.Actor helps you accomplish this most complex task:

1. [What is horizontal scaling.](unit-7/lesson-1)
2. [Overview Proto.Actor Remote.](unit-7/lesson-2)
3. [Example of working with Proto.Actor Remote.](unit-7/lesson-3)

### Module 8 Proto.Actor Cluster

In module 8, you learned how to create distributed applications with a fixed number of nodes. The static membership approach is simple but does not have a ready-made load balancing solution or fault tolerance. A cluster allows you to dynamically increase and decrease the number of nodes used by a distributed application, eliminating the fear of having a single point of failure:

1. [Why do you need clusters.](unit-8/lesson-1)
2. [Membership in the cluster..](unit-8/lesson-2)
3. [Joining to the cluster.](unit-8/lesson-3)
4. [Processing tasks in the Cluster.](unit-8/lesson-4)
5. [Running a Cluster.](unit-8/lesson-5)
6. [How to distribute tasks by using routers.](unit-8/lesson-6)
7. [Reliable task processing.](unit-8/lesson-7)
8. [Cluster Testing.](unit-8/lesson-8)

### Module 9 Persistence Actor

The actor state contained in RAM will be lost when the actor will be stopping or restarting or when the actor system will be stopped or restarted. In this chapter, we will show you how to save this state using the Proto.Actor Persistence module:

1. [What is Event Sourcing.](unit-9/lesson-1)
2. [Persistence actors.](unit-9/lesson-2)
3. [Snapshotting.](unit-9/lesson-3)

## How to get started

Here's how the Proto.Actor Bootcamp works.

### Use Github to Make Life Easy

This Github repository contains Visual Studio solution files and other assets you will need to complete the bootcamp.

Thus, if you want to follow the bootcamp we recommend doing the following:

1. Sign up for [Github](https://github.com/), if you haven't already.
2. [Fork this repository](https://github.com/asynkron/protoactor-bootcamp/fork) and clone your fork to your local machine.
3. As you go through the project, keep a web browser tab open to the [Proto.Actor Bootcamp](https://github.com/asynkron/protoactor-bootcamp/) so you can read all of the instructions clearly and easily.

#### When you're doing the lessons...

A few things to bear in mind when you're following the step-by-step instructions::

- **Don't just copy and paste the code shown in the lesson's README**. You will memorize and learn all the built-in Proto.Actor functions if you will typewriter this code yourself. [Kinesthetic learning](http://en.wikipedia.org/wiki/Kinesthetic_learning) FTW!
- Don't be afraid to ask questions. You can reach the Proto.Actor team and other Proto.Actor users in our Gitter chat [here](https://gitter.im/AsynkronIT/protoactor).

## Docs

We will provide explanations of all key concepts throughout each lesson, but of course, you should bookmark (and feel free to use!) the [Proto.Actor Docs](http://proto.actor/docs/)

## Tools / prerequisites

This course expects the following:

1. You have some programming experience and familiarity with C#
2. A Github account and basic knowledge of Git.
3. You are using a version of Visual Studio ([it's free now!](http://www.visualstudio.com/))
