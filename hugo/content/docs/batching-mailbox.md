---
title: Batching Mailbox
---

# Proto.Mailbox.BatchingMailbox

`BatchingMailbox` is a message queue that collects messages from one or more sources and then group them together into a `MessageBatch` message, before handing the batch over to the assigned `IMessageInvoker`.¨

The batching mailbox can be used together with actors, using the `Props.WithMailbox` method.
Or, as a stand alone feature to use in non-actor scenarios. e.g. Log aggregation, collective reads or writes to a database, or similar realtime-batch oriented scenarios.
