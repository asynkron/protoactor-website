# Lesson 11: Installing Proto.Actor.

To install Proto.Actor, we will use NuGet. NuGet contains all the necessary packages and dependencies to install Proto.Actor. The main package that we need to work with Photo.Actor is Proto. Actor.

NuGet also contains several additional packages we can install to access other features.

[Proto.Actor NuGets](https://www.nuget.org/profiles/ProtoActor)

#### Proto.Schedulers.SimpleScheduler

The first one is the message scheduler package. Using this package, you can schedule a message to send to the specified recipient with delay and frequency.

#### Proto.Router

With this package, you can organize the routing of messages in your application. Use message routing when you need to scale the application.

#### Proto.Persistence.*

This group of packages allows you to save the actor's state using various technologies. For example, Proto.Persistence.SQLite allows you to save the actor's internal state in the SQLite database.

#### Proto.Remote

The Proto.Remote package allows you to organize interaction between actors running on different servers.

#### Proto.Cluster.*

Proto.Cluster.* used to create a cluster.

#### Proto.OpenTracing

This package allows you to debug actors using the [Open Tracing library](https://opentracing.io/)

[To the next unit!](../../unit-2)
