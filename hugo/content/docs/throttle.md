# Proto.Util.Throttle

The `Throttle` class is a utility class used to prevent event flooding.
The Throttle is similar to a _circuit breaker_, but instead of getting triggered by _failure_, it triggers by a _surge of events in a short time_.





Setting up:

```csharp
private readonly ShouldThrottle _shouldThrottle;

/* ... */

_shouldThrottle = Throttle.Create(
    10,
    TimeSpan.FromSeconds(5),
    count => _logger.LogInformation("Throttled {LogCount} logs for component xyz", count)
);
```

Usage:

```csharp
catch(Exception e)
{
    if (_shouldThrottle().IsOpen())
        _logger.LogError(e, "Some operation failed");
}
```
