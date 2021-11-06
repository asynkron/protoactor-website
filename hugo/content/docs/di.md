---
title: Dependency Injection
---

# Dependency Injection

In object-oriented programming, if a class contains objects of another class, then these objects are called dependencies. When instantiating a class, you must also instantiate all dependencies. Creating them directly in the class can be quite inflexible since in this case they cannot change during runtime and in order to create a new dependency, you need to recreate the dependent object.

Dependency Injection is a design pattern that allows an external object to create dependencies for a dependent object. Thus, the creation and binding of dependencies occur outside the class that depends on them.

There are three types of classes in Dependency Injection:
1. A *client class* depends on objects of other classes.
2. A *service class* is a dependency, it provides a service to a client class.
3. *Injector class* injects the service class into the client class.

There are three different types of Dependency Injection:

1. *Constructor injection*. The injector passes dependencies through the constructor of the client class.
2. *Property or setter injection*. The injector uses a public setter method of the client class to inject dependencies.
3. *Interface injection*. The client class implements an interface with methods for Dependency Injection, and the injector uses these methods.

The main benefits of using Dependency Injection are:
1. Simplifies writing unit tests.
2. Reduces the amount of code in the client class.
3. Easily maintain a code since all classes are isolated.
4. Loosely coupled code that can be reused in different situations.
5. Easily extensible code.

## Microsoft.Extensions.DependencyInjection

You can implement dependency injection yourself or use ready-made packages. One of such packages is Microsoft.Extensions.DependencyInjection, developed by Microsoft and compatible with .Net 6, .Net 5, .Net Core 2.1, and .Net Core 3.1.

The Microsoft.Extensions.DependencyInjection package allows you to configure the Dependency Injection container, create dependencies, and service provider. In order to use DI, we need to register the services our application needs in the `ConfigureServices()` method of the `Startup` class. This method has an `IServiceCollection` parameter that provides a list of all the services the application depends on. Using this parameter, we can register the service in the container.

```csharp
public void ConfigureServices (IServiceCollection services)
{
    services.Add (new ExampleService (IExample, new Example ()));
} 
```

In this example, we have registered a service that implements the `IExample` interface. The second parameter of the `Add()` method is an instance of the `Example` class, which should be implemented in our project.

## Dependency Injection in Proto.Actor

Proto.Actor can have dependencies injected. In the following example, dependencies are injected through the constructor.

First, let's take a look at how to configure a Proto.Actor to use DI. We need to register the `ActorSystem` service as a singleton.

```csharp
services.AddSingleton(serviceProvider => new ActorSystem().WithServiceProvider(serviceProvider));
```

Then register all actors with a transient lifetime.

For example, if we have an actor of type `DependencyInjectedActor`, register the type with a transient lifetime. 

```csharp
services.AddTransient<DependencyInjectedActor>();
```

Transient lifetime means that a new object of `DependencyInjectedActor` type will be created each time it is requested.

In order to get a `Props` from the DI container use `ActorSystem` object.

```csharp
var props = _actorSystem.DI().PropsFor<DependencyInjectedActor>();
```
