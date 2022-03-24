# Asp.NET Health Checks

```csharp
public class ActorSystemHealthCheck : IHealthCheck
{
    private readonly ActorSystem _system;
    public ActorSystemHealthCheck(ActorSystem system)
    {
        _system = system;
    }
        
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken()) =>
        _system.Shutdown.IsCancellationRequested switch
        {
            true => Task.FromResult(HealthCheckResult.Unhealthy()),
            _    => Task.FromResult(HealthCheckResult.Healthy())
        };
}
```
