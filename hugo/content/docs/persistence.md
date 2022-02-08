---
layout: docs.hbs
title: Persistence of actor's state
---

# Persistence of actor's state

<img src="../images/Persistence-blue.png" style="max-height:400px;margin-bottom:20px;margin-left:20px">

In some scenarios it is needed to permanently save actor's state. The same state should be restored during actor start.

## Simple state persistence

As an example, temeperature measures in a room will be used. There is room actor that receives temperature measures in some regular periods.

```protobuf

message TemperatureMeasured{
    double measure = 1;
    google.protobuf.Timestamp measured_at = 2;
}

service Room{
   rpc ProcessTemperatureChange(TemperatureMeasured) returns(google.protobuf.Empty) {}
}

```

Room actor has a state that is persisted in some database. To make it as readable as possible there are two delegates that define functions to get and restore this state from database. More details are not important in this example.

```csharp

public record TemperatureState(double Measure, DateTimeOffset ChangedAt)
    {
        public static readonly TemperatureState Empty = new(default, DateTimeOffset.MinValue);
    }

public record RoomState(string Id, TemperatureState Temperature)
    {
        public RoomState(string id) : this(id, TemperatureState.Empty) { }
    }

public delegate Task<RoomState?> TryGetRoomState(string roomId);

public delegate Task PersistRoomState(RoomState roomState);

```

Both delegates might be injected in the actor's constructor. Then on actor's start, state is loaded.

``` csharp

    public class Room : RoomBase
    {
        private readonly string _roomId;
        private RoomState _roomState = null!;

        private readonly TryGetRoomState _tryGetRoomState;
        private readonly PersistRoomState _persistRoomState;
        

        public Room(IContext context, TryGetRoomState tryGetRoomState, PersistRoomState persistRoomState) : base(context)
        {
            _tryGetRoomState = tryGetRoomState;
            _persistRoomState = persistRoomState;
            _roomId = context.GetActorId();
        }

        public override async Task OnStarted()
        {
            _roomState = await _tryGetRoomState(_roomId)
                         ?? new RoomState(_roomId);
        }
    }

```

After applying any change on actor's state, the second delegate is used and the state of actor is persisted.

```csharp

    public override async Task ProcessTemperatureChange(TemperatureMeasured request)
        {
            if (TemperatureHasChanged())
            {
                _roomState = _roomState with
                {
                    Temperature = new TemperatureState(request.Measure, request.MeasuredAt.ToDateTimeOffset())
                };

                await _persistRoomState(_roomState);
            }
            
            bool TemperatureHasChanged() =>
                MeasureIsNewer() && MeasureIsDifferent();

            bool MeasureIsNewer() => request.MeasuredAt.ToDateTimeOffset() > _roomState.Temperature.ChangedAt;
            bool MeasureIsDifferent() => Math.Abs(request.Measure - _roomState.Temperature.Measure) > 0.01;
        }

```

## Persistence using events and snapshots

If actor is using eventsourcing to maintain its state then it is possible to [Proto.Persistence module](persistence-proto-persistence.md) to make it easier.
