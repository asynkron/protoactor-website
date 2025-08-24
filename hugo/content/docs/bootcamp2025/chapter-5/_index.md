# Chapter 5: Testing Proto.Actor Systems with Proto.TestKit

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

Testing is a crucial part of developing reliable systems. Actor-based systems introduce concurrency, which can make testing tricky if you try to do it with traditional approaches (like expecting results immediately, or trying to synchronize threads manually). Proto.Actor provides the Proto.TestKit module (for .NET and Go) to assist in writing tests for actors. In this chapter, we cover how to use test kit features such as test probes to capture messages, how to simulate timings, and general strategies for testing actors, both in isolation and as part of a system.

## Challenges in Testing Actors
Actors encapsulate state and interact via messages, so verifying behavior often means observing either the actor’s state via messages or its interactions (what messages it sends out).

In a multi-actor scenario, the nondeterministic scheduling means tests need to be written to account for messages arriving in varying orders or with some delays.

Proto.TestKit is inspired by Akka’s TestKit, providing tools like TestProbe (an actor that records messages it receives) and utilities to await conditions or intercept actor communications.

## Proto.TestKit Overview
Proto.TestKit offers a few key components:

- TestProbe: A probe is essentially a dummy actor we create in tests that can receive messages and allows us to assert on them. We can use a probe to:
  - Send messages to other actors and receive their replies.
  - Watch what messages an actor sends to others by placing the probe in between or attaching it as a monitor.
  - Generally, observe actor behavior without modifying the actors under test.
- Mailbox/Receive Probes: You can attach a probe to an actor’s Props so that the probe will get a copy of messages sent to or from that actor. For example, `Props.WithReceiveProbe(probe)` in .NET will forward every message an actor processes to the probe after the actor has processed it. Similarly, `WithSendProbe(probe)` captures messages the actor sends out. In Go, there are `testkit.WithMailboxStats` or `WithReceiveMiddleware` to capture messages via middleware. These are advanced, but extremely useful for white-box testing of actor internals.
- Awaiting and conditions: The test kit provides functions like `probe.ExpectNext<T>` or `probe.GetNextMessage()` with timeouts to wait for messages to arrive, and `probe.ExpectNoMessage()` to assert that nothing arrives within a duration. There’s also `AwaitCondition` to poll for some condition to become true within a time. These help eliminate brittle sleep-based tests; you can wait up to X seconds for an event rather than assuming it happens by X.

See [Testing Examples](examples/) for hands-on usage.

## Best Practices for Testing Proto.Actor:
- Use probes to avoid sleeps: Instead of doing `Thread.Sleep` or `time.Sleep` and then checking if something happened, use the probe’s `GetNextMessage` or `AwaitCondition` to wait until the expected event occurs or a timeout passes.
- Isolate actor logic: For unit testing an actor, treat it as a black box – send it messages, and observe responses or outgoing messages. If the actor modifies some external state (like a database), consider abstracting that behind an interface so you can inject a fake implementation for testing that records what happens.
- Use TestKit for integration tests: You can spin up a mini actor system in a test, spawn multiple actors (some could be test probes) and simulate interactions. For example, test a supervisor strategy by making an actor throw an exception and verifying the supervisor restarted it. Proto.TestKit doesn’t directly assert “actor restarted,” but you infer it from behavior.
- Cluster testing: You can run multiple cluster members in a test (like the Go example above) to simulate distributed scenarios. The TestProvider or AutoManaged provider is useful here. If you need to test how your code handles node failures, you might start and stop cluster members in the test and see how the remaining system responds.

## A brief note on Proto.TestKit in Go
The Go testkit is slightly less full-featured than the .NET one (since Go doesn’t have async/await, the patterns differ). But the fundamentals are there: TestProbe actor with `Request` and `ExpectNoMessage`, and utility for `GetNextMessageOf[T]`. The Go testkit also has `NewTestMailboxStats` which can be used as a mailbox middleware to capture mailbox events, similar to .NET’s `TestMailboxStats`.

## Summary
Testing actor-based systems can be made systematic with these tools: TestProbe to simulate actors and capture communications, and scheduling hooks to control timing. By using Proto.TestKit, you can write tests that:

- Send messages to an actor and assert on the replies (using probe or future/promise style).
- Verify internal messaging: that an actor sent a specific message as a result of something.
- Simulate sequences of events and ensure the actor ends up in the expected state.

With Proto.Actor, since everything is message-driven, most tests boil down to “given this input message (and maybe some preceding messages), the actor should send/output this other message or produce that effect.” The testkit helps capture those outputs for verification.

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

