# Logging

## Configuring Logging on .NET

In Proto.Actor .NET, Logging is configured via the static `Proto.Log` setting.

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
