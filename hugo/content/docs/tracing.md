# How to use Proto.Opentracing

## Introduction

In the software development process, it is necessary to perform tracing for many reasons. Here are some of them: to find the cause and localize various bugs, to find the parts of the program that are slow, to track the workflow of the program, to measure the speed of execution of queries to the database, to better understand how different services interact with each other. In complex multithreaded applications, it is very important to keep track of the order in which various actions are performed. The use of a tracer helps developers to significantly reduce the time and effort for detecting and fixing problem areas in the code.

The Proto.Actor allows you an instrument that helps to implement complex parallel systems that can be hard to debug. In this case, it is very convenient to use a good tracing system. Proto.Opentracing has been developed for this purpose. In this article, we will take a look at what Proto.Opentracing is and how to use it for Proto.Actor.

## What is Proto.Opentracing

Proto.Opentracing is the Opentracing implementation for Proto.Actor. Opentracing is a distributed tracing API that offers developers a standardized approach to tracing. It has its own specification, which does not depend on the programming language. It is implementation independent and can be used along with various distributed tracing systems.

## Opentracing concepts and terminology

### Tracer

Tracer allows you to create Spans and Scopes, inject and extract tracing data from the Span. It can inject data from multiple services and multiple processes. A Tracer consists of a collection of Spans. It stores information about transactions and the workflow of a distributed system. Tracer allows you to get a Span that is active at the current time. Additional data can be passed in the Tracer, which can be useful for debugging and monitoring the program. This data is called Baggage.

### Span

**Span** is a named tracing block that displays a part of the workflow. Span contains information about the start and end time of its execution, may contain tags, logs, baggage items, and Span Context.

**Tags** are key-value pairs that apply to the entire Span and are used to provide more detailed information about a part of the workflow in data tracing. There is a list of [standard Opentracing tags](https://github.com/opentracing/specification/blob/master/semantic_conventions.md) that can be used in the most common situations.
Proto.Opentracing has its own tags that you can use for Proto.Actor. Let's take a look at these tags.

- `MessageType` - the name of the message type.
- `TargetPID` - process ID of the message target.
- `SenderPID` - process ID of the message sender.
- `ActorPID` - current actor process ID. It equals TargetPID when this is a receiving Span, or SenderId when this is a sending Span.
- `ActorType` - a type of the current actor.

**Logs** are key-value pairs that describe a particular moment within the context of a Span. They are used to document a specific point in time. They can also be applied to the entire Span.

**Baggage** items are key-value pairs that store additional useful information. This information can be transferred between different processes. Baggage items apply to a specified Span, Span Context, and all Spans that directly or transitively refer to a local Span.

### SpanContext

SpanContext can transfer data between processes. It consists of two parts: an implementation-dependent state to refer to the distinct Span within a trace
and baggage items.

### Scope

**The scope** allows you to manage the state of Spans. It can activate and deactivate them since at the current time only one Span can be active.

## Main advantages of using Opentracing

- Opentracing can be used with different distributed tracing systems, such as Zipkin, Jaeger, LightStep, DataDog, and others.
- It provides a standardized way to collect and map data from asynchronous threads.
- Opentracing allows you to constantly collect up-to-date data from the runtime.
- Opentracing allows you to transfer data between different threads and processes.

### Examples of using distributed tracing:

- Monitoring the effectiveness of the application. When an application uses many services, using tracing, you can easily find out how long each service takes and where an exception is thrown.
- Tracing allows you to know how fast requests are transmitted between different applications.
- Tracking the history of the work of one process, which is simultaneously accessed by several services.
- Tracking the history of request execution from start to finish.

We have covered the benefits of using an Opentracing and its basic concept and terminology. Now let's see how to use Proto.Opentracing for Proto.Actor.

## Getting started with Proto.Opentracing

In order to start working with Proto.Opentracing you need to install the Proto.Opentracing package. To do this, you must install Visual Studio at least the 2019 version and .Net Core 3.0.

In Proto.Opentracing you can create a local tracer or use a global tracer instance. Tracer allows to create scopes for send, receive, request, forward message functions. Depending on the function, a Span is created, which is marked with different tags, such as `MessageType`, `TargetPID`, `SenderPID`, `ActorPID`, `ActorType`. Proto.Opentracing allows to log errors, create custom Spans, and work with baggage. Let’s look at all these features in more detail.

### Setup tracing for Proto.Actor

In order to use Proto.Opentracing with Proto.Actor first you need to create Proto.Actor and call extension method `WithOpenTracing()`.

```csharp
var props = Props
    .FromProducer(() => new MyActor())
    //this extension enables opentracing
    .WithOpenTracing();
```

This method has optional parameters: `sendSpanSetup`, `receiverSpanSetup`, and `tracer`. The sendSpanSetup is a delegate that is used for building scope for send, request, and forward methods. The `receiverSpanSetup` is used for building the scope for receive method. If you do not pass these parameters, then in both cases the defaultSpanSetup will be used.

An example of a function that creates a spanSetup:

```csharp
public static void SetupSpan(ISpan span, object message)
{
    if (span == null) return;

    span.Log(
            new Dictionary<string, object>
            {
                { "message", message }
            });

    span.SetTag("IsSend", true);
}
```

In this example, we first check if the Span is `null`. If not, then create a log, in which we write the message that was passed to the function, and also add a tag that indicates that the Span belongs to the send function.

In Proto.Opentracing there is a function for logging exceptions that occur in some methods. This function writes the name, message, and stack trace of the exception to the log.

Another parameter of the method `WithOpenTracing()` that we have not covered is a tracer.
You can use different tracers for different purposes. For example, a tracer for endpoints, a tracer for a database, a tracer for credentials. If you do not want to create a tracer, then Proto.Opentracing will use the global tracer. The global tracer works like a global instance and can be called from anywhere. The global tracer transfers all operations to another tracer, which will be registered in the future.

In Proto.Opentracing tracer injects a Span Context, which contains important information for tracing, in textmap format. You can extract this context to get the data you need in the right place in the program as shown in the example below.

```csharp
ISpanContext spanContext =
    tracer.Extract(BuiltinFormats.TextMap, new TextMapInjectAdapter(dictionary));
```

### Using Proto.Opentracing for Root Context

A context is a tool that allows you to create, run and communicate with actors. The Root Context creates actors and is responsible for the interactions between them.

Proto.Opentracing allows use of distributed tracing for `IRootContext`. To do this you need to call the extension methods
`rootContext.WithOpenTracing()`

### Using Jaeger to view the tracing logs

Opentracing in itself does not provide a way to view the tracing logs. But it is compatible with many distributed tracing systems such as: CNCF Jaeger, LightStep, Instana, Apache SkyWalking, inspectIT, stagemonitor, Datadog, Wavefront by VMware, Elastic APM. These systems offer a user-friendly UI for viewing tracing logs.

Let's take a look at how to view the tracing logs generated using Opentracing in Jaeger. First, you need to download and run Jaeger. You can do it in several ways.

1. Download executable binaries from [here](https://www.jaegertracing.io/download/#binaries). Then run the file _jaeger-all-in-one.exe_ from the binaries archive.
2. Download pre-built docker image using command `docker pull jaegertracing/all-in-one:1.24`. In order to run Jaeger from the docker image, run the following command

```csharp
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.24
```

To access the Jaeger UI go to [http://localhost:16686](http://localhost:16686). In the Jaeger UI on the left side of the screen, you can select the service for which you want to view the tracing logs and click the **Find Tracers** button. After that Jaeger will show a list of all tracers that were made on the backend for selected service.

### Conclusion

In this article, we examined what Proto.OpenTracing is, the main advantages of its usage, how to apply it to a Proto.Actor, and how to view the tracing logs in Jaeger. Try Proto.OpenTracing for your applications and debug and monitor complex distributed programs easily and fast.
