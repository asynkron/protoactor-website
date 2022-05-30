# Asp.NET Health Checks


## ConfigureServices

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddHealthChecks().AddCheck<ActorSystemHealthCheck>("actor-system");
    //...
```

## Configure

```csharp
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {

        //....

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();

            endpoints.MapHealthChecks("/health/live");
        });
```

## Health Check implementation

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
