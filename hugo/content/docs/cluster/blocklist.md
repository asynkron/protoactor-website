---
layout: docs.hbs
title: Blocklist
---

# Blocklist

Each cluster member maintains a list of blocked members within the cluster. A member can be blocked in cases where there are problems communicating with it or it is overloaded. Such situation is detected when [gossip](gossip.md) heartbeat times out.

## Detecting self block

A cluster member may learn that other members have blocked it. This could happen when e.g. it recovers from a temporary overload state. It can also learn about its blocked status via gossip.

If it then attempted to reconnect to other cluster members, the connections would be rejected due to the fact, this member is blocked. Since there is no way to recover from the blocked status, the cluster member shuts down.

### Handling self block

The ActorSystem and the cluster infrastructure shuts down when self block is detected. However this may leave the application hosting the ActorSystem in a zombie state. The process may still be active, and even responding to some events unrelated to ActorSystem. At the same time, all actor-related activity stops and the application instance does not participate in the cluster.

One way to handle such situation is to add a health check to the ASP.NET pipeline, with the intention that hosting infrastructure (e.g. Kubernetes) will restart the application instance.

```csharp
builder.Services
    .AddHealthChecks()
    .AddCheck<ActorSystemHealthCheck>("actor-system-health");

// ...

app.UseHealthchecks("/healthz");
```

Another option is to monitor the state of the actor system directly.

```csharp
actorSystem.Shutdown.Register(() =>
{
    // wait for shutdown to complete
    actorSystem.Cluster().ShutdownAsync().Wait();
    
    Environment.Exit(1); 
    // or alternatively, recreate and restart the cluster member
});
```