
Chapter 5: Testing Proto.Actor Systems with Proto.TestKit
Testing is a crucial part of developing reliable systems. Actor-based systems introduce concurrency, which can make testing tricky if you try to do it with traditional approaches (like expecting results immediately, or trying to synchronize threads manually). Proto.Actor provides the Proto.TestKit module (for .NET and Go) to assist in writing tests for actors. In this chapter, we’ll cover how to use test kit features such as test probes to capture messages, how to simulate timings, and general strategies for testing actors, both in isolation and as part of a system.

Challenges in Testing Actors

Actors process messages asynchronously, so test code must account for timing (a message sent might not be processed immediately).

Actors encapsulate state and interact via messages, so verifying behavior often means observing either the actor’s state via messages or its interactions (what messages it sends out).

In a multi-actor scenario, the nondeterministic scheduling means tests need to be written to account for messages arriving in varying orders or with some delays.

Proto.TestKit is inspired by Akka’s TestKit, providing tools like TestProbe (an actor that records messages it receives) and utilities to await conditions or intercept actor communications.

Proto.TestKit Overview

Proto.TestKit offers a few key components:

TestProbe: A probe is essentially a dummy actor we create in tests that can receive messages and allows us to assert on them. We can use a probe to:

Send messages to other actors and receive their replies.

Watch what messages an actor sends to others by placing the probe in between or attaching it as a monitor.

Generally, observe actor behavior without modifying the actors under test.

Mailbox/Receive Probes: You can attach a probe to an actor’s Props so that the probe will get a copy of messages sent to or from that actor. For example, Props.WithReceiveProbe(probe) in .NET will forward every message an actor processes to the probe after the actor has processed it
GitHub
GitHub
. Similarly, WithSendProbe(probe) captures messages the actor sends out. In Go, there are testkit.WithMailboxStats or WithReceiveMiddleware to capture messages via middleware. These are advanced, but extremely useful for white-box testing of actor internals (without changing the actor code).

Awaiting and conditions: The test kit provides functions like probe.ExpectNext<T> or probe.GetNextMessage() with timeouts to wait for messages to arrive, and probe.ExpectNoMessage() to assert that nothing arrives within a duration
GitHub
GitHub
. There’s also AwaitCondition to poll for some condition to become true within a time. These help eliminate brittle sleep-based tests; you can wait up to X seconds for an event rather than assuming it happens by X.

Let’s walk through examples in both C# and Go to illustrate typical test scenarios.

Example 1: Testing a Request-Response Actor (Ping-Pong)

Suppose we have a simple actor that replies “pong” when it receives “ping”. We want to test that:

Sending "ping" yields a "pong" response.

The actor doesn’t send any unexpected messages.

C# Test using TestProbe:

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
        // Expect a response of type string (this will await until it gets one or timeout)
        var response = await probe.GetNextMessageAsync<string>();
        Assert.Equal("pong", response);

        // Verify no extra messages:
        await probe.ExpectNoMessageAsync(TimeSpan.FromMilliseconds(100));
    }
}


In this test, we used CreateTestProbe() to get a probe and its PID. The probe acts like an actor that we can send messages from and that buffers received messages. We then spawned the PingActor normally. Instead of doing system.Root.RequestAsync (which could have been another way to get a response), we demonstrated using the probe:

probe.Request(pingPid, "ping") sends the "ping" message to pingPid, but it does so in a way that sets the sender of the message as the probe itself. In Proto.TestKit, probe.Request is essentially calling Context.Request from within the probe’s context
GitHub
GitHub
. This means when PingActor does Respond("pong"), Proto.Actor will deliver the "pong" to the sender (which is the probe).

Then probe.GetNextMessageAsync<string>() waits for the probe’s actor to receive a message of type string. It returns that message, which we assert is "pong". If no message arrives in the default timeout (usually 1 second), the test fails. If a wrong type or content arrives, we can detect that too.

We call ExpectNoMessageAsync with 100ms to ensure nothing else was sent to the probe after the "pong". This is a quick check to catch any unexpected extra messages.

Go Test using TestProbe:

 

In Go, suppose we use the built-in testing package. The protoactor-go/testkit provides similar probe functionality:

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

func TestPingActorResponds(t *testing.T) {
    system := actor.NewActorSystem()
    // Create a new TestProbe actor
    probe := testkit.NewTestProbe()
    probePID := system.Root.Spawn(actor.PropsFromProducer(func() actor.Actor { return probe }))

    // Spawn the actor under test
    pingPID := system.Root.Spawn(actor.PropsFromProducer(func() actor.Actor { return &PingActor{} }))

    // Use probe to send request
    probe.Request(pingPID, "ping")
    // Get the next message of type string that the probe receives
    reply, err := testkit.GetNextMessageOf[string](probe, 1*time.Second)
    require.NoError(t, err)
    require.Equal(t, "pong", reply)

    // Ensure no further messages
    require.NoError(t, probe.ExpectNoMessage(50 * time.Millisecond))
}


In the Go test, we:

Created a TestProbe using NewTestProbe(). In protoactor-go, a TestProbe itself implements actor.Actor. We spawned it like a normal actor to get a PID (probePID). The probe actor will record messages it receives.

We spawned the PingActor under test, got its PID.

We used probe.Request(pingPID, "ping"). The Go TestProbe has a Request method that sends a message with the probe as sender (similar to .NET).

We then used testkit.GetNextMessageOf[string](probe, 1*time.Second) to retrieve the next message of type string from the probe’s inbox. This returns the message ("pong") or an error if timeout. We assert that we got "pong".

probe.ExpectNoMessage(50 * time.Millisecond) checks that nothing else arrived at the probe in that short duration after.

If the actor didn’t respond or responded with the wrong content, these tests would catch it (either by timing out or failing the equality check).

Example 2: Observing Actor Internal Messages with Probes

For more complex actors, you might want to ensure that when they receive a certain message, they send out some other message to another actor. You can test this by using probe as the recipient of that outgoing message. One way is to have the actor under test accept a PID to send responses to (so you pass the probe’s PID), or you use the Props.WithSendProbe or WithReceiveProbe feature.

 

C# Example – Attaching a probe to observe outgoing messages:

 

Suppose we have an actor that upon receiving a StartJob message, sends a JobStarted message to some “monitor” actor (could be a PID it has). We want to test that it indeed sends JobStarted. If we don’t want to modify the actor to inject a test PID, we can intercept at the Props level:

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


What happens here is WithSendProbe(probe) wraps the actor’s context such that whenever the actor calls context.Send or context.Respond, the message is relayed to the probe (in addition to being delivered to its actual target)
GitHub
GitHub
. This allows the test to capture outgoing communications passively. In our test, we don’t even need to know who the actual target was; if a JobStarted was sent anywhere, our probe got a copy. We then assert on it.

 

Proto.TestKit also has TestMailboxStats (in .NET) and similar in Go, which can hook into the actor’s mailbox to count messages or detect if a message was received. For example, WithMailboxProbe(probe) in .NET uses a ProbeMailboxStatistics under the hood to send every mailbox-received message to the probe
GitHub
GitHub
. This can be used to verify order of messages in mailbox or detect if certain messages were enqueued.

 

In Go, to achieve similar things, you can use testkit.NewTestMailboxStats(predicate) which returns a mailbox stats that can signal when a certain message passes through the mailbox
GitHub
GitHub
. For example, to wait until a "done" message is processed, as shown in the Proto.Actor Go testkit examples
GitHub
GitHub
.

Example 3: Timing and Scheduler Testing

If your actor uses timers (e.g., ReceiveTimeout or schedules messages to itself), testing timing-dependent behavior could be flaky if you rely on real time. Proto.Actor provides a hook ISchedulerHook in .NET which you can implement to intercept scheduled events, allowing your test to simulate time progression deterministically
GitHub
GitHub
. In practice, you might not need this unless you have complex timing logic. A simpler approach in tests is often to shorten timeouts (e.g., set a small ReceiveTimeout in the actor for test) and then use ExpectNextMessage within that span.

Best Practices for Testing Proto.Actor:

Use Probes to avoid sleeps: Instead of doing Thread.Sleep or time.Sleep and then checking if something happened, use the probe’s GetNextMessage or AwaitCondition to wait until the expected event occurs or a timeout passes. This makes tests more deterministic and faster (they don’t always wait the full timeout if the message comes earlier).

Isolate actor logic: For unit testing an actor, treat it as a black box – send it messages, and observe responses or outgoing messages. If the actor modifies some external state (like a database), consider abstracting that behind an interface so you can inject a fake implementation for testing that records what happens.

Use TestKit for integration tests: You can spin up a mini actor system in a test, spawn multiple actors (some could be test probes) and simulate interactions. For example, test a supervisor strategy by making an actor throw an exception (maybe by sending it a special message that causes error) and verifying the supervisor restarted it (maybe the actor has a counter state that resets on restart – you can check that). Proto.TestKit doesn’t directly assert “actor restarted,” but you infer it from behavior.

Cluster testing: You can run multiple cluster members in a test (like the Go example above) to simulate distributed scenarios. The TestProvider or AutoManaged provider is useful here. There is also mention of Cluster Testing in Proto.Actor documentation (they provide hooks to simulate network partitions or member changes). If you need to test how your code handles node failures, you might use those hooks or simply start and stop cluster members in the test and see how the remaining system responds
proto.actor
.

A brief note on Proto.TestKit in Go

The Go testkit is slightly less full-featured than the .NET one (since Go doesn’t have async/await, the patterns differ). But as we saw, the fundamentals are there: TestProbe actor with Request and ExpectNoMessage, and utility for GetNextMessageOf[T]. The Go testkit also has NewTestMailboxStats which can be used as a mailbox middleware to capture mailbox events, similar to .NET’s TestMailboxStats
GitHub
GitHub
.

Summary

Testing actor-based systems can be made systematic with these tools: TestProbe to simulate actors and capture communications, and scheduling hooks to control timing. By using Proto.TestKit, you can write tests that:

Send messages to an actor and assert on the replies (using probe or future/promise style).

Verify internal messaging: that an actor sent a specific message (to another actor or to itself) as a result of something.

Simulate sequences of events and ensure the actor ends up in the expected state (state verification might mean the actor sends some state out or you query it via a message).

With Proto.Actor, since everything is message-driven, most tests boil down to “given this input message (and maybe some preceding messages), the actor should send/output this other message or produce that effect.” The testkit helps capture those outputs for verification.

 

This concludes the Proto.Actor Bootcamp. We started from the foundational concepts of the actor model, explored Proto.Actor’s core API for building actors in C# and Go, then extended to remote communication and cluster-based virtual actors, and finally saw how to test actor systems effectively. With these tutorials, you should be able to create your own concurrent, distributed applications using Proto.Actor, step by step: first get comfortable with actors and messages, then scale out with remoting or clustering, and always validate your actor behavior with thorough tests. Happy acting!
