---
title: "Supervisor Strategy Recipes"
date: 2025-08-09
draft: false
tags: [supervision, guides]
---

# Supervisor Strategy Recipes

Supervisors decide what to do when their children fail. The recipes below build on the core [Supervision](supervision.md) concepts with practical defaults.

## Restart with backoff

Restarting too quickly can thrash the system. Apply exponential backoff and give up after repeated failures.

### .NET
```csharp
public override SupervisorStrategy SupervisorStrategy =>
    new OneForOneStrategy(
        maxNrOfRetries: 5,
        withinTimeRange: TimeSpan.FromSeconds(10),
        decider: ex => SupervisorDirective.Restart);
```

### Go
```go
var strategy = actor.NewOneForOneStrategy(5, time.Second*10, func(reason interface{}) actor.Directive {
    return actor.RestartDirective
})
```

## Escalate critical faults

When a child cannot make progress (e.g. invalid configuration), escalate.

```csharp
var strategy = new OneForOneStrategy(maxNrOfRetries:0, withinTimeRange:TimeSpan.Zero,
    decider: ex => SupervisorDirective.Escalate);
```

These patterns combine: escalate fatal errors and restart transient ones with backoff.
