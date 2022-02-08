---
layout: docs.hbs
title: Persistence using Proto.Persistence module
---

# `Proto.Persistence` module

You can choose to have actors persist their state by using the `Proto.Persistence` module.
This allows an actor to recover its state when it is started and supports three modes of operation:

- Event Sourcing
- Snapshotting
- Event Sourcing with Snapshotting

## Event Sourcing

When using event sourcing, each state change is modelled as an event that is applied to the actor both during the recovery phase and when running live.
The Persistence plugin takes an `Action<Event> applyEvent` method as a parameter that is called whenever an event is saved, or loaded from the underlying storage during recovery.
It is important that all state changes are defined in this `ApplyEvent` method, including transitioning to different behaviors.

### Example

We're going to implement a simple counter actor using the `Persistence` class. This counter will support a single message type, `Add` that has an amount to add:

```csharp
public class Add {
    public int Amount { get; set; }
}

```

The first thing we want to do is configure the `Persistence` class when the actor is created:

```csharp
public class Counter : IActor
{
    private int _value = 0;
    private readonly Persistence _persistence;

    public Counter(IEventStore eventStore, string actorId)
    {
        _persistence = Persistence.WithEventSourcing(eventStore, actorId, ApplyEvent);
    }
    //...
}
```

Here we use the static `WithEventSourcing` method to create our instance of the `Persistence` class, passing in a `eventStore`, `actorId` and `ApplyEvent` method.
We'll get to the `ApplyEvent` method below, but for now know that you pass in an implementation of `IEventStore`, which represents the underlying storage system used to support persistence and an `actorId` that should be a unique identifier for the actor.

Our `Counter` actor only supports two messages:

```csharp
public async Task ReceiveAsync(IContext context)
{
    switch (context.Message)
    {
        case Started _:
            await _persistence.RecoverStateAsync();
            break;
        case Add msg:
            if (msg.Amount > 0)
            {
                await _persistence.PersistEventAsync(new Added { Amount = msg.Amount });
            }
            break;
    }
}
```

When `Started`, we call `RecoverStateAsync` to recover the state. This will load all saved events from the underlying storage and call the `ApplyEvent` method for each.
When we receive an `Add` message, we first run some business logic, then save an `Added` event. `PersistEventAsync` saves the event to the underlying storage and calls the `ApplyEvent` method:

```csharp
private void ApplyEvent(Event @event)
{
    switch (@event.Data)
    {
        case Added msg:
            _value = _value + msg.Amount;
            break;
    }
}
```

It is inside the `ApplyEvent` method that any state changes for the actor occur - here we simply add the amount from the `Added` message to our current value.

## Snapshotting

When configured to just use snapshotting, this is the equivalent of only ever saving the _current_ state of the actor, i.e. no audit log of changes is kept.

We can rewrite the `Counter` example above to only use snapshotting:

```csharp
internal class Counter : IActor
{
    private int _value;
    private readonly Persistence _persistence;

    public Counter(ISnapshotStore snapshotStore, string actorId)
    {
        _persistence = Persistence.WithSnapshotting(snapshotStore, actorId, ApplySnapshot);
    }

    private void ApplySnapshot(Snapshot snapshot)
    {
        if (snapshot.State is int ss)
        {
            _value = ss;
        }
    }

    public async Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Started _:
                await _persistence.RecoverStateAsync();
                break;
            case Add msg:
                if (msg.Amount > 0)
                {
                    _value += msg.Amount;
                    await _persistence.PersistSnapshotAsync(_value);
                }
                break;
        }
    }
}
```

Here we are using the static `WithSnapshotting` method to create the `Persistence` class, passing in a `snapshotStore` and `actorId` but this time a `ApplySnapshot` method that will be called when `RecoverStateAsync` is called when the actor is started.

## Event Sourcing and Snapshotting

We can use both event sourcing and snapshotting together. When used in this manner, snapshotting becomes a performance optimisation for cases when you have large numbers of events to replay to rebuild the state of your actor.
When `RecoverStateAsync` is called, if there are any snapshots saved, then the most recent one will be loaded along with any events that occured _after_ the snapshot was taken.
The `Persistence` plugin manages this tracking internally through the use of an index that is incremented for each saved event. Any time a snapshot is taken, it is tied to index of the actor at that time.

We can rewrite the `Counter` example above to use event sourcing with snapshotting:

```csharp
internal class Counter : IActor
{
    private int _value;
    private readonly Persistence _persistence;

    public Counter(IEventStore eventStore, ISnapshotStore snapshotStore, string actorId)
    {
        _persistence = Persistence.WithEventSourcingAndSnapshotting(eventStore, snapshotStore, actorId, ApplyEvent, ApplySnapshot);
    }

    private void ApplyEvent(Event @event)
    {
        switch (@event.Data)
        {
            case Added msg:
                _value = _value + msg.Amount;
                break;
        }
    }
    private void ApplySnapshot(Snapshot snapshot)
    {
        if (snapshot.State is int ss)
        {
            _value = ss;
        }
    }

    public async Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Started _:
                await _persistence.RecoverStateAsync();
                break;
            case Add msg:
                if (msg.Amount > 0)
                {
                    await _persistence.PersistEventAsync(new Added { Amount = msg.Amount });
                    if (ShouldTakeSnapshot())
                    {
                        await _persistence.PersistSnapshotAsync(_value);
                    }
                }
                break;
        }
    }

    private bool ShouldTakeSnapshot()
    {
        // some logic to determine whether to take a snapshot or not
    }
}
```

Now when the `Counter` actor is started, any snapshots that have been saved will be applied before any remaining events.

### Snapshot strategies

You can optionally specify an `ISnapshotStrategy` to auto-save snapshots when saving an event. The provided strategies are:

- `EventTypeStrategy` - saves a snapshot based on the type of event saved
- `IntervalStrategy` - saves a snapshot at a regular interval based on the number of events saved, i.e. every 100 events
- `TimeStrategy` - saves a snapshot at a regular interval based on time, i.e. wait at least 6 hours between snapshots

On saving an event, the `Persistence` module will save a snapshot if the `ShouldTakeSnapshot` method of the `ISnapshotStrategy` returns true.

```csharp
internal class Counter : IActor
{
    private int _value;
    private readonly Persistence _persistence;

    // note that here we are using IProvider, which implements IEventStore and ISnapshotStore in cases where you prefer to pass in a single parameter to your actor that represents the storage system being used for both
    public Counter(IProvider provider, string actorId)
    {
        _persistence = Persistence.WithEventSourcingAndSnapshotting(provider, provider, actorId, ApplyEvent, ApplySnapshot, new IntervalStrategy(10), () => _value);
    }

    // ApplyEvent() and ApplySnapshot() unchanged

    public async Task ReceiveAsync(IContext context)
    {
        switch (context.Message)
        {
            case Started _:
                await _persistence.RecoverStateAsync();
                break;
            case Add msg:
                if (msg.Amount > 0)
                {
                    await _persistence.PersistEventAsync(new Added { Amount = msg.Amount });
                }
                break;
        }
    }
}
```

Here we pass in a strategy saying to save a snapshot every 10 events.

{{< note >}}
We have removed the manual saving of snapshots, as this is now taken care of internally through the use of the snapshot strategy.
{{</ note >}}
