---
title: Throttle
---

# Proto.Util.Throttle

The `Throttle` class is a utility class used to prevent event flooding.
The Throttle is similar to a **circuit breaker**, but instead of getting triggered by **failure**, it triggers by a **surge of events in a short time**.

This can be very useful in scenarios where you consume large number of events, be it from an HTTP endpoint, or a message queue or log such as RabbitMQ or Kafka.
Under normal conditions, you might want to fully log error events if something fails during processing, but in case there is a flood of errors, you might not want to fill up your log system with thousands or millions of log entries.
Here is where you can benefit from using the `Throttle` class.


Setting up:

```csharp
private readonly ShouldThrottle _shouldThrottle;

/* ... */

_shouldThrottle = Throttle.Create( 
    // max number of events/calls
    10,
    
    // in this duration
    TimeSpan.FromSeconds(5),
    
    // callback for when valve opens back up again
    count => _logger.LogInformation("Throttled {LogCount} logs for component xyz", count)
);
```

Usage:

```csharp
catch(Exception e)
{
    if (_shouldThrottle().IsOpen()) //if the valve of the throttle is open, log the event
        _logger.LogError(e, "Some operation failed");
}
```

`_shouldThrottle` will internally count the number calls made to it and close the valve if the number of calls exceeds the configuration provided when setting it up.
