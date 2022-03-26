# Integration Testing

## Test Fixture

```csharp
namespace MySystem.Tests;

public class MySystemClassFixture<T> : WebApplicationFactory<T> where T:class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            //replace some of the system dependencies with mocks / fakes
            services.AddSingleton<ITelemetryStore, InMemTelemetryStore>();
            services.AddSingleton<ISourceStateStore, MockSourceStateStore>();

        });

        builder.ConfigureAppConfiguration((ctx, configurationBuilder) =>
        {
            //reconfigure some of the configuration keys
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string>()
            {
                ["ProtoActor:UnitTest"] = "true",
                ["ProtoActor:ClusterPort"] = "0",
            });
        });
        base.ConfigureWebHost(builder);
    }
}
```


## Writing a Test

```csharp
public class SomeTest : IClassFixture<MysystemClassFixture<Startup>>
{
    private readonly ITestOutputHelper _output;
    private readonly Cluster _cluster;
    private readonly MockStore _store;

    public SomeTest(MysystemClassFixture<Startup> factory, ITestOutputHelper output)
    {
        var services = factory.Server.Services;
        _output = output;
        _cluster = services.GetRequiredService<Cluster>();
        _store = (MockStore)services.GetRequiredService<IKeyValueStore<LoadbalancerSite>>();

    }
    ...
    
```
