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
