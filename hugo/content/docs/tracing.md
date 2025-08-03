---
title: Distributed Tracing
---

# Distributed tracing with Proto.Actor

![tracing](images/Tracing-blue.png)

## Introduction

In concurrent and distributed system development, observability is an essential feature.
One way to improve observability is to use some form of distributed tracing.
Distributed tracing is generally a good tool that can help find the cause and localize various bugs, to find the parts of the program that are slow,
to track the workflow of the program, to measure the speed of execution of queries to the database,to better understand how different services interact with each other.
In complex multi-threaded applications, it is very important to keep track of the order in which various actions are performed.
The use of a tracer helps developers to significantly reduce the time and effort for detecting and fixing problem areas in the code.

Actor systems in general, due to their concurrent and distributed nature can sometimes be hard to debug. In this case, it is convenient to use a distributed tracing system. Proto.OpenTracing has been developed for this purpose.
In this article, we will take a look at what Proto.OpenTelemetry is and how to use it for Proto.Actor.

## What is OpenTelemetry

**OpenTelemetry** is a set of APIs that offer developers a standardized approach to tracing, metrics and logs. Implementation is vendor-agnostic and might be configured to send data to the backed that is needed. More details might be found [here](https://opentelemetry.io/).

## What is Proto.OpenTelemetry

**Proto.OpenTelemetry** is a set of middlewares for Proto.Actor, these middlewares integrate the Proto.Actor message receive pipeline with **OpenTelemetry**.

### Examples of using distributed tracing

- Monitoring the effectiveness of the application. When an application uses many services, using tracing, you can easily find out how long each service takes and where an exception is thrown.
- Tracing allows you to know how fast requests are transmitted between different applications.
- Tracking the history of the work of one process, which is simultaneously accessed by several services.
- Tracking the history of request execution from start to finish.

We have covered the benefits of using an OpenTelemetry and its basic concept and terminology. Now let's see how to use Proto.OpenTelemetry for Proto.Actor.

## Getting started with Proto.OpenTelemetry

[Realtime map is using Proto.OpenTelemetry](https://github.com/asynkron/realtimemap-dotnet/blob/ccaa9099f5a6cae615feabd38c3cfcc08e791a6f/Backend/Program.cs#L19) and might be used as a working example.

First thing that needs to be done is registration of [TracerProvider](https://opentelemetry.io/docs/reference/specification/trace/api/#tracerprovider). We can use extension placed in the package `OpenTelemetry.Extensions.Hosting`.
This helps us to register `TracerProvider` with configured instance of `TracerProviderBuilder`. In this place we can put some common instrumentation that is applied to all Spans.
It is also possible to setup OpenTelemetry Protocol exporter depending which backend is used. In order to reuse below example, `OpenTelemetry.Exporter.OpenTelemetryProtocol` nuget package is needed.

Little remark, C# OpenTelemetry implementation is based on [System.Diagnostics.Activity](https://docs.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs).
Naming convention placed there is not equivalent with OpenTelemetry specification. From that reason, in the C# implementation Span is named as Activity.

`AddProtoActorInstrumentation()` extension from `Proto.OpenTelemetry` package, is adding Proto.Actor [activity source](https://docs.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-collection-walkthroughs#sources) into instrumentation.

```csharp

static void ConfigureTracing(WebApplicationBuilder builder) =>
    builder.Services.AddOpenTelemetryTracing(b =>
        b.SetResourceBuilder(ResourceBuilder
                .CreateDefault()
                .AddService(builder.Configuration["Service:Name"])
                .AddAttributes(new KeyValuePair<string, object>[]
                {
                    new("someCommonTag", builder.Configuration["SomeCommonTag"]),
                    new("env", builder.Environment.EnvironmentName)
                })
            )
            .AddProtoActorInstrumentation()
            .AddOtlpExporter(opt => { opt.Endpoint = new Uri(builder.Configuration["Otlp:Endpoint"]); }));

```

### OpenTelemetry .NET AutoInstrumentation

Proto.Actor .NET is also compatible with [OpenTelemetry .NET AutoInstrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation). Just for reference, OpenTelemetry .NET AutoInstrumentation is an open-source tool from OpenTelemetry and is used to instrument the .NET libraries implicitly. You are not required to configure the tracing or metrics builder explicitly (as shown in the above code snippet) any more, and you can even use it alongside manual instrumentation, if required. It relies on the .NET CLR (Common Language Runtime) for its execution. The main reason why Proto.Actor is compatible with the OpenTelemetry .NET AutoInstrumentation is because the `ActivitySourceName` for all the Proto.Actor library traces is `Proto.Actor`, and once you specify that, all the traces would be collected.

#### Configurations

Import the latest OpenTelemetry .NET AutoInstrumentation package in your .NET project

```csharp
<PackageReference Include="OpenTelemetry.AutoInstrumentation" Version="1.0.0" />
```

Configure these .NET CLR environment variables, besides the [required ones](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation?tab=readme-ov-file#instrument-a-net-application)

`OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES=Proto.Actor`

You can even mention any manual `ActivitySource`s above to collect any manual instrumented data from them.

You can either set `Console_Exporter` to `true` or `false`, depending on whether you want to view the instrumented data in the console (for debugging purposes). By default, they are all set to `false`.

`OTEL_DOTNET_AUTO_TRACES_CONSOLE_EXPORTER_ENABLED=true`

You can configure the OpenTelemetry collector endpoint and protocol using the environment variables

- `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317`
- `OTEL_EXPORTER_OTLP_PROTOCOL=grpc`

#### Word of caution!

OpenTelemetry .NET AutoInstrumentation works only with `System.Diagnostics.DiagnosticSource` version of 8.0.0 or more, and `.NET` framework version of 4.6.2 or more. Hence, request you to go through their detailed documentation before using.

### Setup tracing for Proto.Actor

In order to use Proto.OpenTelemetry with Proto.Actor first you need to create actor's Props and call extension method `WithTracing()`.

By default it adds three tags to each send and receive Spans: `proto.actortype`, `proto.actorpid`, `proto.senderpid`.
It also adds tracing headers to each message envelope to be able to properly setup remote span during remote receive.

```csharp
var props = Props
    .FromProducer(() => new MyActor())
    .WithTracing();
```

This method has optional parameters: `sendActivitySetup`, `receiveActivitySetup`.
The `sendActivitySetup` is a delegate that is used for building scope for send, request, and forward methods. The `receiveActivitySetup` is used for building the scope for receive method.
If you do not pass these parameters, then in both cases the [DefaultSetupActivity](https://github.com/asynkron/protoactor-dotnet/blob/dev/src/Proto.OpenTelemetry/OpenTelemetryHelpers.cs#L14) will be used.

An example of a function that creates an activity setup:

```csharp
    private static void SendActivitySetup(Activity? span, object message)
    {
        span?
            .AddBaggage("messageType", message.GetType().Name)
            .SetTag("IsSend", true);
    }
```

In this example, we first check if the Span is `null`.
If not, then [add baggage item](https://opentelemetry.io/docs/reference/specification/baggage/api/), in which we write the message type that was passed to the function, and also add a tag that indicates that the Span belongs to the send function.

### Using Proto.OpenTelemetry for Root Context

A **context** is a tool that allows you to create, run and communicate with actors. The Root Context creates actors and is responsible for the interactions between them.

Proto.OpenTelemetry allows use of distributed tracing for `IRootContext`. To do this you need to call the extension methods
`rootContext.WithTracing()`.

Example of distributed tracing root context setup might be found in [the realtime map](https://github.com/asynkron/realtimemap-dotnet/blob/main/Backend/MQTT/Ingress.cs#L18).

### Using Jaeger to view the tracing logs

OpenTelemetry in itself does not provide a way to view the tracing logs. But it is compatible with many distributed tracing systems. They offer a user-friendly UI for viewing tracing logs.

Let's take a look at how to view the tracing logs generated using OpenTelemetry in Jaeger.
Jaeger image `jaegertracing/opentelemetry-all-in-one` has [built-in OpenTelemetry collector](https://www.jaegertracing.io/docs/1.18/opentelemetry/) so there is no need to setup OLTP exporter separately.

```yml
version: '3.7'

services:
  jaeger:
    image: jaegertracing/opentelemetry-all-in-one
    ports:
      - 16686:16686
      - 4317:55680 
```

Port description:

- `4317` - port used for OpenTelemetry Protocol receiver
- `16686` -port where Jaeger UI is available

To access the Jaeger UI go to [http://localhost:16686](http://localhost:16686). In the Jaeger UI on the left side of the screen, you can select the service for which you want to view the tracing logs and click the **Find Tracers** button.
After that Jaeger will show a list of all tracers that were made on the backend for selected service.

### Conclusion

In this article, we examined what Proto.OpenTelemetry is, the main advantages of its usage, how to apply it to Proto.Actor, and how to view the tracing logs in Jaeger.
Try Proto.OpenTelemetry for your applications and debug and monitor complex distributed programs easily and fast.
