---
title: Logging
---

# Logging

## Configuring logging on .NET

In Proto.Actor .NET, Logging is configured via the static `Proto.Log` setting.

### Using console

```csharp
public static void SetupLogger()
{
    //Configure ProtoActor to use Console logger
    Proto.Log.SetLoggerFactory(
        LoggerFactory.Create(l => l.AddConsole().SetMinimumLevel(LogLevel.Error)));
}
```

### Using Serilog

```csharp
public static void SetupLogger()
{
    //Configure SeriLog
    Log.Logger = new LoggerConfiguration().WriteTo.Console(LogEventLevel.Error).CreateLogger();
    
    //Configure ProtoActor to use Serilog
    Proto.Log.SetLoggerFactory(
        LoggerFactory.Create(l => l.AddSerilog().SetMinimumLevel(LogLevel.Error)));
}
```

#### Tweaking Serilog log levels

Example `appsettings.json` file.

```json
  "Serilog": {
    "Using": [
      "Serilog.Exceptions",
      "Serilog",
      "Serilog.Sinks.Console",
      "Serilog.Sinks.Seq"
    ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "System": "Information",        
        "Microsoft": "Warning",
        "Microsoft.AspNetCore": "Warning",
        "System.Net.Http.HttpClient": "Warning",
        
        //set log level for proto.actor cluster
        "Proto.Cluster": "Warning",
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "restrictedToMinimumLevel": "Debug",
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level}] {Environment} {ApplicationName} {ApplicationVersion} {ServiceId} {ChargePointId}: {Message} {Exception} {NewLine}"
        }
      },
      {
        "Name": "Seq",
        "Args": {
          "serverUrl": "http://localhost:5341"
        }
      }
    ],
    "Enrich": [
      "FromLogContext",
      "WithExceptionDetails"
    ]
  },
  //other configs
```

#### Exporting Proto.Actor logs to OpenTelemetry collector

OpenTelemetry .NET AutoInstrumentation cannot be used to collect and export the Proto.Actor library logs, since AutoInstrumentation can collect and export logs of .NET `ILogger` only. Proto.Actor uses Serilog for logging, and Serilog is not supported till AutoInstrumentation v1.0.0. Hence, you need to configure the [Serilog OpenTelemetry sink](https://github.com/serilog/serilog-sinks-opentelemetry) explicitly, either through `appsettings.json` or `LoggerConfiguration()`, after importing the latest Serilog OpenTelementry sink library in your project.

```csharp
<PackageReference Include="Serilog.Sinks.OpenTelemetry" Version="1.1.0" />
```

```json
  "Serilog": {
    "Using": [
      "Serilog.Exceptions",
      "Serilog",
      "Serilog.Sinks.Console",
      "Serilog.Sinks.Async"
    ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "System": "Information",        
        "Microsoft": "Information",
        "Microsoft.AspNetCore": "Information",
        "System.Net.Http.HttpClient": "Information",
        "Proto.Cluster": "Information",
        "Proto.Context": "Information",
        "GossipStateManagement": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "restrictedToMinimumLevel": "Information",
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level}] {Environment} {ApplicationName} {ApplicationVersion} {ServiceId} {ChargePointId}: {Message} {Exception} {NewLine}"
        }
      },
      {
        "Name": "Async",
        "Args": {
          "configure": [
            {
              "Name": "OpenTelemetry",
              "Args": {
                "Endpoint": "http://localhost:4317",
                "Protocol": "Grpc",
                "RestrictedToMinimumLevel": "Information"
              }
            }
          ]
        }
      }
    ],
    "Enrich": [
      "FromLogContext",
      "WithExceptionDetails",
      "WithMachineName",
      "WithThreadId"
    ]
  }
```