# Chapter 5: Testing Examples

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

[Back to Chapter 5](../)

## Example 1: Testing a Request-Response Actor (Ping-Pong)
Suppose we have a simple actor that replies “pong” when it receives “ping”. We want to test that:

- Sending "ping" yields a "pong" response.
- The actor doesn’t send any unexpected messages.

```mermaid
sequenceDiagram
    participant Probe as TestProbe
    participant Actor as PingActor
    Probe->>Actor: ping
    Actor-->>Probe: pong
    Probe->>Probe: assert reply
```

### C# Test using TestProbe:
```csharp
using Proto;
using Proto.TestKit;
using Xunit;  // assuming xUnit for demonstration

public class PingActor : IActor
{
    public Task ReceiveAsync(IContext context)
    {
        if (context.Message is string msg && msg == "ping")
            context.Respond("pong");
        return Task.CompletedTask;
    }
}

public class PingActorTests
{
    [Fact]
    public async Task PingActor_ShouldRespondWithPong()
    {
        var system = new ActorSystem();
        // Create a test probe actor
        var (probe, probePid) = system.Root.CreateTestProbe();
        // Spawn the actor under test
        var pingProps = Props.FromProducer(() => new PingActor());
        var pingPid = system.Root.Spawn(pingProps);

        // Use the probe to send a request and capture the response
        probe.Request(pingPid, "ping");
        // Expect a response of type string
        var response = await probe.GetNextMessageAsync<string>();
        Assert.Equal("pong", response);

        // Verify no extra messages:
        await probe.ExpectNoMessageAsync(TimeSpan.FromMilliseconds(100));
    }
}
```

In this test, we used `CreateTestProbe()` to get a probe and its PID. The probe acts like an actor that we can send messages from and that buffers received messages. Instead of doing `system.Root.RequestAsync`, we demonstrated using the probe to send and capture replies.

### Go Test using TestProbe:
In Go, suppose we use the built-in testing package. The `protoactor-go/testkit` provides similar probe functionality:

```go
import (
    "testing"
    "time"
    "github.com/asynkron/protoactor-go/actor"
    "github.com/asynkron/protoactor-go/testkit"
    "github.com/stretchr/testify/require"
)

type PingActor struct{}

func (p *PingActor) Receive(ctx actor.Context) {
    if msg, ok := ctx.Message().(string); ok && msg == "ping" {
        ctx.Respond("pong")
    }
}

func TestPingActor_ShouldRespondWithPong(t *testing.T) {
    system := actor.NewActorSystem()
    probe := testkit.NewTestProbe(system)

    props := actor.PropsFromProducer(func() actor.Actor { return &PingActor{} })
    pid := system.Root.Spawn(props)

    probe.Send(pid, "ping")
    msg := probe.ExpectMessage(t, time.Second)
    require.Equal(t, "pong", msg)
    probe.ExpectNoMessage(t, 100*time.Millisecond)
}
```

## Example 2: Observing Actor Internal Messages with Probes
For more complex actors, you might want to ensure that when they receive a certain message, they send out some other message to another actor. You can test this by using a probe as the recipient of that outgoing message. One way is to have the actor under test accept a PID to send responses to (so you pass the probe’s PID), or you use the `Props.WithSendProbe` or `WithReceiveProbe` feature.

### C# Example – Attaching a probe to observe outgoing messages:
```csharp
var system = new ActorSystem();
var (probe, _) = system.CreateTestProbe();

// Create Props for actor under test, with a probe to observe its outgoing messages.
var props = Props.FromProducer(() => new JobActor())
    .WithSendProbe(probe);   // this will forward any message sent by JobActor to the probe

var jobActorPid = system.Root.Spawn(props);
system.Root.Send(jobActorPid, new StartJob("abc123"));

// Now expect that the actor sent out a JobStarted message:
var startedMsg = await probe.GetNextMessageAsync<JobStarted>();
Assert.Equal("abc123", startedMsg.JobId);
```

## Example 3: Timing and Scheduler Testing
If your actor uses timers (e.g., `ReceiveTimeout` or schedules messages to itself), testing timing-dependent behavior could be flaky if you rely on real time. Proto.Actor provides a hook `ISchedulerHook` in .NET which you can implement to intercept scheduled events, allowing your test to simulate time progression deterministically. A simpler approach in tests is often to shorten timeouts and then use `ExpectNextMessage` within that span.

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

