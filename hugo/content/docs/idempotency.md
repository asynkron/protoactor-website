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

## .NET example

```csharp
public class TransferActor : IActor
{
    private readonly HashSet<string> _seen = new();
    public Task ReceiveAsync(IContext ctx)
    {
        switch (ctx.Message)
        {
            case Transfer cmd when _seen.Add(cmd.Id):
                // unique key in DB prevents double credit
                database.Execute("INSERT INTO transfers(id, amount) VALUES(@Id,@Amount)", cmd);
                break;
        }
        return Task.CompletedTask;
    }
}
```

## Go example

```go
type transferActor struct {
    seen map[string]struct{}
}

func (a *transferActor) Receive(ctx actor.Context) {
    switch msg := ctx.Message().(type) {
    case *Transfer:
        if _, ok := a.seen[msg.Id]; ok {
            return // already processed
        }
        a.seen[msg.Id] = struct{}{}
        // UPSERT guarantees a single effect
        db.Exec(`INSERT INTO transfers(id, amount) VALUES(?, ?) ON CONFLICT DO NOTHING`, msg.Id, msg.Amount)
    }
}
```
