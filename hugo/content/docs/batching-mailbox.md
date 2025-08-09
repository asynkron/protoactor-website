---
title: Batching Mailbox
---

# Proto.Mailbox.BatchingMailbox

`BatchingMailbox` is a message queue that collects messages from one or more sources and then groups them into a `MessageBatch` message before handing the batch over to the assigned `IMessageInvoker`.

The batching mailbox can be used together with actors via the `Props.WithMailbox(() => new BatchingMailbox(size))` method. It can also be used as a standalone feature in non-actor scenarios like log aggregation, collective reads or writes to a database or network, or other real-time batch-oriented scenarios.

For more information on batched processing using Proto.Actor .NET, please refer [here](https://proto.actor/docs/envelope-pattern/).
