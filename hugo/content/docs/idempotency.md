---
title: "Idempotency in Messaging"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# Idempotency in Messaging

In distributed systems messages may be delivered more than once. Idempotent handlers ensure that processing a message multiple times yields the same result, making retries safe.

## Techniques

- Track processed message identifiers and discard duplicates
- Use database constraints or compare-and-swap operations
- Design operations so that applying them twice has no additional effect

## Proto.Actor Support

Proto.Actor offers tools to help implement idempotency:

- `Props.WithClusterRequestDeduplication` keeps a cache of recent requests to drop duplicates
- [Envelope Pattern](envelope-pattern.md) groups messages so you can acknowledge a batch after state is persisted
- [Durability](durability.md) explains delivery guarantees and why duplicate messages appear

Combine these techniques with [Reentrancy](reenter.md) for non-blocking retries.
