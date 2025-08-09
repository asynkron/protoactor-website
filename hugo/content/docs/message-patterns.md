---
title: "Messaging Patterns"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# Messaging Patterns

Actors communicate by exchanging messages. Proto.Actor supports several common patterns that build on this simple foundation.

- **Send** – fire and forget, the sender does not expect a reply.
- **[Ask Pattern](ask-pattern.md)** – request–response using `Request` or `RequestAsync`.
- **[Envelope Pattern](envelope-pattern.md)** – batch multiple messages and acknowledge them as a unit.
- **Routing** – use [Routers](routers.md) to distribute work across actors or forward messages.

The diagram below summarizes how messages can be routed and queued.

```mermaid
graph LR

message(MSG)
class message message
router(Router)
class router yellow
message2(MSG)
class message2 message
message3(MSG)
class message3 message
queue([Queue])
class queue queue

subgraph r[Router]
    router
end

message --> router

router ---> message2
router ---> message3
router ---> queue

```
