# OpenTelemetry, Grafana, and .NET

## Example setup

```csharp
var otlpEndpoint = configuration.GetValue<string>("Otlp:Endpoint");
if (!string.IsNullOrWhiteSpace(otlpEndpoint))
{
    Console.WriteLine($"Using OpenTelemetry Endpoint:{otlpEndpoint}");

    // this is enabled by default in .NET5, .NET&, but needed for .NET CoreApp 3.2
    AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);

    services.AddOpenTelemetryTracing((builder) =>
    {
        builder
            //add tracing for Proto.Actor
            .AddProtoActorInstrumentation()
            .SetResourceBuilder(ResourceBuilder.CreateDefault()
            .AddService("name-of-this-service"))
            //add tracing for other infrastructure you might use
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddGrpcClientInstrumentation()
            .AddSqlClientInstrumentation(options =>
            {
                options.SetDbStatementForText = true;
                options.SetDbStatementForStoredProcedure = true;
            })
            .AddMassTransitInstrumentation()
            ;

            //set up the exporter to export to e.g. Grafana Agent
            var otlpOptionsEndpoint = new Uri(otlpEndpoint);
            builder.AddOtlpExporter(otlpOptions =>
            {
                otlpOptions.Endpoint = otlpOptionsEndpoint;
            });
    });
}
```

## Annotating spans with data

Spans alone are sometimes not enough to make sense of what is happening in a distributed system.
Therefore, it is possible to augment the spans with extra information.

### Tags

Tags are key-value-pairs that are stored together with a span.
Tags are searchable.
e.g.
You can search for "order-id=123" in Grafana.

```csharp
//set a tag
Activity.Current?.AddTag("order-id", myOrder.Id);
```

### Events

Events are identifiers and a timestamp.
e.g. "connection-closed" + timestamp

```csharp
//add an event
//events are just names + timestamp
Activity.Current?.AddEvent(new ActivityEvent("eventname", DateTimeOffset.UtcNow));
```

### Baggage

Baggage is data that flows across spans and services.
one service can `AddBaggage("user-id", 123)` and another service can read this information using `GetBaggageItem("user-id")`.

```csharp
//add baggage
//baggage is like http headers and are carried between spans. and can be read via GetBaggageItem
Activity.Current?.AddBaggage("user-id", currentUser.Id);
```

## Debugging OTEL

OpenTelemetry in .NET can be tricky to set up correctly, and sometimes things just fail silently.

To easier diagnose this, you can force the OTEL library to log into files.

Add a file named `OTEL_DIAGNOSTICS.json` to your solution, set it to "Copy always".

Set the content to:

```json
{
  "LogDirectory": ".",
  "FileSize": 1024,
  "LogLevel": "Error"
}
```

## Installation

### Nuget packages

Relevant Nugets:

- OpenTelemetry.Exporter.OpenTelemetryProtocol
- OpenTelemetry.Extensions.Hosting
- OpenTelemetry.Instrumentation.AspNetCore
- OpenTelemetry.Instrumentation.GrpcNetClient
- OpenTelemetry.Instrumentation.Http
- OpenTelemetry.Instrumentation.SqlClient
- OpenTelemetry.Contrib.Instrumentation.MassTransit

### Logging

If you are using Serilog, you can augment your logs with Trace, Span, and ParentId using `Serilog.Enrichers.Span`.

This allows e.g. Grafana Loki to ingest this information from your logs so that traces, spans and log entries can be correlated.
