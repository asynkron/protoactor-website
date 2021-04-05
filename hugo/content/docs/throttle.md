# Proto.Util.Throttle

The `Throttle` class is a utility class used to prevent event flooding.


Setting up:

```
_shouldThrottle = Throttle.Create(
    10,
    TimeSpan.FromSeconds(5),
    count => _logger.LogInformation("Throttled {LogCount} logs for component xyz", count)
);
```

Usage:

```
catch(Exception e)
{
    if (_shouldThrottle().IsOpen())
        _logger.LogError(e, "Some operation failed");
}
```
