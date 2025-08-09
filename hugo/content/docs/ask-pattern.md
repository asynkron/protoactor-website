---
title: "Ask Pattern"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# Ask Pattern

The ask pattern provides request–response semantics between actors. An actor sends a message and waits for a reply, typically by using a future or awaiting a `Task`.

In Proto.Actor you can use `Context.Request` when the sender expects the recipient to know who sent the message. For an awaitable response, `Context.RequestAsync<T>` or `PID.RequestAsync<T>` returns a `Task<T>` that completes when the reply arrives.

```csharp
var response = await pid.RequestAsync<MyReply>(new MyRequest());
```

Because the actor thread is released while waiting, combine the ask pattern with [Reentrancy](reenter.md) to avoid blocking the actor. For fire‑and‑forget messaging, prefer `Context.Send`.

See [Actor Communication](communication.md) for an overview of messaging APIs and [PID](pid.md) for additional request options.
