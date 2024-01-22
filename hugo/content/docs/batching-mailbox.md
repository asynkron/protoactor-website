---
title: Batching Mailbox
---

# Proto.Mailbox.BatchingMailbox

`BatchingMailbox` is a message queue that collects messages from one or more sources and then group them together into a `MessageBatch` message, before handing the batch over to the assigned `IMessageInvoker`.

The batching mailbox can be used together with actors, using the `Props.WithMailbox(() => new BatchingMailbox(size))` method. It can also be used as a stand alone feature in non-actor scenarios like log aggregation, collective reads or writes to a database or network, or similar realtime-batch oriented scenarios.

For more information on batched processing using Proto.Actor .NET, please refer [here](https://proto.actor/docs/envelope-pattern/).
