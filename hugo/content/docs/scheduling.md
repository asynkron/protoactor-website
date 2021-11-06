---
title: "Scheduling"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Scheduling Messages

![scheduling](images/Scheduling-blue.png)

In C#, we provide the `SimpleScheduler` implementation of the `ISimpleScheduler`interface.
This allows you to do operations such as `ScheduleTellOnce`, `ScheduleRequestOnce` and `ScheduleTellRepeatedly`

```csharp
ISimpleScheduler scheduler = new SimpleScheduler();
var pid = context.Spawn(Actor.FromProducer(() => new ScheduleGreetActor()));

scheduler
    .ScheduleTellOnce(TimeSpan.FromMilliseconds(100), context.Self, new SimpleMessage("test 1"))
    .ScheduleTellOnce(TimeSpan.FromMilliseconds(200), context.Self, new SimpleMessage("test 2"))
    .ScheduleTellOnce(TimeSpan.FromMilliseconds(300), context.Self, new SimpleMessage("test 3"))
    .ScheduleTellOnce(TimeSpan.FromMilliseconds(400), context.Self, new SimpleMessage("test 4"))
    .ScheduleTellOnce(TimeSpan.FromMilliseconds(500), context.Self, new SimpleMessage("test 5"))
    .ScheduleRequestOnce(TimeSpan.FromSeconds(1), context.Self, pid, new Greet("Daniel"))
    .ScheduleTellOnce(TimeSpan.FromSeconds(5), context.Self, new Hello())
    .ScheduleTellRepeatedly(TimeSpan.FromSeconds(3), TimeSpan.FromMilliseconds(500), context.Self, new HickUp(), out timer);
```

Another option if you want to perform some form of action after a given period of time is:

```csharp
context.ReenterAfter(Task.Delay(1000), t => {
     //do stuff after 1000ms w/o blocking the actor while waiting
});
```

This will asynchronously wait for the task to complete, then send a message back to the actor itself, containing the
block of code to execute within the actor's concurrency constraint.
