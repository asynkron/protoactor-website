---
title: Metrics
---

# Metrics

Nowadays, there are a lot of complex distributed systems, and every day their number is increasing. When developing such systems, it is important to strive for the highest possible performance.
But how can we assess the performance of a system? There are special metrics for this.

Metrics are numerical data that are calculated or aggregated over a period of time. Metrics give us an idea of ​​the current and historical state of the system. They can be used for statistical analysis, to predict the future behavior of the system.

There are many types of metrics that can be used for monitoring the performance of distributed systems. For example, latency, bandwidth, error, saturation, traffic, etc. For each distributed system, we need to choose a list of metrics that suit it exactly.

For convenient graphical display and analysis of metrics, we should use monitoring systems such as Grafana, Prometheus.
These systems allow us to create dashboards and display specific metrics over a given period of time. For each distributed system, it is necessary to be able to store metrics into monitoring systems for their further analysis.

## Metrics in Proto.Actor

Proto.Actor is using metrics provided by [OpenTelemetry](https://opentelemetry.io/docs/reference/specification/metrics/). With simple Proto.Actor instrumentation from `Proto.OpenTelemetry`, it is possible to get insights how actor system is performing.
Below it is possible to find more details regarding built in metrics.

Small remark, when using Prometheus exporter directly in the application then the metric names get postfixed with unit name, e.g. histogram `protoactor_threadpool_latency_duration` is renamed to `protoactor_threadpool_latency_duration_seconds`.

### Proto.Actor Metrics

| Name                                             | Type      | Labels                              |
|--------------------------------------------------|-----------|-------------------------------------|
| protoactor_threadpool_latency_duration           | Histogram | id, address                         |
| protoactor_deadletter_count                      | Count     | id, address, messagetype            |
| protoactor_actor_spawn_count                     | Count     | id, address, actortype              |
| protoactor_actor_stopped_count                   | Count     | id, address, actortype              |
| protoactor_actor_restarted_count                 | Count     | id, address, actortype              |
| protoactor_actor_failure_count                   | Count     | id, address, actortype              |
| protoactor_actor_mailbox_length                  | Gauge     | id, address, actortype              |
| protoactor_actor_messagereceive_duration         | Histogram | id, address, actortype, messagetype |
| protoactor_future_started_count                  | Count     | id, address                         |
| protoactor_future_timedout_count                 | Count     | id, address                         |
| protoactor_future_completed_count                | Count     | id, address                         |

### Proto.Remote Metrics

| Name                                    | Type  | Labels                          |
|-----------------------------------------|-------|---------------------------------|
| protoremote_message_serialize_count     | Count | id, address, messagetype        |
| protoremote_message_deserialize_count   | Count | id, address, messagetype        |
| protoremote_spawn_count                 | Count | id, address, kind               |
| protoremote_endpoint_connected_count    | Count | id, address, destinationaddress |
| protoremote_endpoint_disconnected_count | Count | id, address, destinationaddress |

### Proto.Cluster Metrics

| Name                                                    | Type      | Labels                                           |
|---------------------------------------------------------|-----------|--------------------------------------------------|
| protocluster_virtualactors                              | Gauge     | id, address, clusterkind                         |
| protocluster_virtualactor_spawn_duration                | Histogram | id, address, clusterkind                         |
| protocluster_virtualactor_requestasync_duration         | Histogram | id, address, clusterkind, messagetype, pidsource |
| protocluster_virtualactor_requestasync_retry_count      | Count     | id, address, clusterkind, messagetype            |
| protocluster_members_count                              | Gauge     | id, address                                      |
| protocluster_resolve_pid_duration                       | Histogram | id, address, clusterkind                         |

## Getting started

[Realtime map is using Proto.OpenTelemetry](https://github.com/asynkron/realtimemap-dotnet/blob/ccaa9099f5a6cae615feabd38c3cfcc08e791a6f/Backend/Program.cs#L20) and might be used as a working example.

First what needs to be done is to register `MeterProvider` instance. It might be achieved with ready to use extension from `OpenTelemetry.Extensions.Hosting` nuget package.
This extension is using builder pattern to properly configure `MeterProvider` with labels common for all metrics.
It is also possible to setup OpenTelemetry Protocol exporter depending which backend is used. In order to reuse below example, `OpenTelemetry.Exporter.OpenTelemetryProtocol` nuget package is needed.
It is suggested also to configure  `PeriodicExportingMetricReaderOptions` if it is needed to control how fast metrics are exported (default value is 60 seconds).

`OpenTelemetry` metrics in C# implementation use [System.Diagnositcs.Metrics](https://docs.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation).
`AddProtoActorInstrumentation()` extension shown in the example is adding Proto.Actor meter name.
Method has additional parameter `useRecommendedHistogramBoundaries` which is true by default. It causes that default buckets used in OpenTelemetry implementation are changed to more preffered ones.

```csharp
void ConfigureMetrics(WebApplicationBuilder builder) =>
    builder.Services.AddOpenTelemetryMetrics(b =>
        b.SetResourceBuilder(ResourceBuilder
                .CreateDefault()
                .AddAttributes(new KeyValuePair<string, object>[]
                {
                    new("someLabel", builder.Configuration["SomeLabel"]),
                    new("env", builder.Environment.EnvironmentName)
                })
                .AddService(builder.Configuration["Service:Name"])
            )
            .AddProtoActorInstrumentation()
            .AddOtlpExporter(opt =>
            {
                opt.Endpoint = new Uri(builder.Configuration["Otlp:Endpoint"]);
                opt.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds =
                    builder.Configuration.GetValue<int>("Otlp:MetricsIntervalMilliseconds");
            })
    );

```

## Using Prometheus and Grafana to store and visualize metrics

Another example of Prometheus metrics setup might be found in [ActorMetrics example](https://github.com/asynkron/protoactor-dotnet/tree/dev/examples/ActorMetrics).
This one doesn't use OpenTelemetry Exporter and the application has own [endpoint for Prometheus metrics](https://github.com/asynkron/protoactor-dotnet/blob/dev/examples/ActorMetrics/Startup.cs#L29).

In this section, it will be presented how to run Prometheus and Grafana locally using Docker. In the setup showned above, it is also required to run [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) to be able to save metrics in Prometheus.

```yml
version: '3.7'

services:     
  grafana:
    image: grafana/grafana
    ports:
      - 3000:3000
      
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - 9090:9090
      
      
  otel-collector:
    image: otel/opentelemetry-collector
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    command: ["--config=/etc/otel-collector-config.yaml"]
    ports:
      - 8889:8889
      - 4317:4317
```

prometheus.yml

```yml
scrape_configs:
- job_name: 'otel-collector'
  scrape_interval: 10s
  static_configs:
  - targets: ['otel-collector:8889']

```

otel-collector-config.yaml

```yml
receivers:
  otlp:
    protocols:
      grpc:

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"

processors:
  batch:

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]

```

A few words of exmplanation regarding docker-compose setup:

* Grafana setup is bare minimum to run it, UI is available under `3000` port
* Prometheus requires `prometheus.yml` config file to properly configure targets from where metrics are scraped.
In this setup, file points only to OpenTelemetry Collector's prometheus endpoint. Prometheus is available under `9090` port.

* OpenTelemetry Collector exposes two ports. Port `4317` is for grpc OTLP receiver. Applications that export metrics should use this port. Port `8889` is scrape endpoint for Prometheus. Prometheus is configured to use this port to get metrics.
More information about OpenTelemetry Collector configuration might be found [here](https://opentelemetry.io/docs/collector/configuration/)

After running this docker-compose and some application that exposes metrics, it is possible to create some dashboard in Grafana do visualize it.

[ActorMetrics example](https://github.com/asynkron/protoactor-dotnet/tree/dev/examples/ActorMetrics) contains a
[sample dashboard](https://github.com/asynkron/protoactor-dotnet/blob/dev/examples/ActorMetrics/grafana/dashboards/proto-actor-sample-dashboard.json) that shows how to create a visualisation of metrics.

![sample dashboard](images/dashboard-overview.png)
