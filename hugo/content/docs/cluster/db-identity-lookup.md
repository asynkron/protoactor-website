---
layout: docs.hbs
title: DB Identity Lookup (.NET)
---

# DB Identity Lookup

This strategy uses external database to keep information about spawned actors in the cluster. Actor's placement is first checked in the cluster cache. If it is not present there then is tried to be grabbed from the database. If actor spawn information is not found there then based on actor placement strategy, new actor spawn is done. After successful placement, information about it is saved in the database.

## How it works

From a consumer perspective, the IdentityLookup is called if the actor system currently has no knowledge of the location of some virtual actor.

This is illustrated here, where the IdentityLookup is called if there is no hit in the PidCache for the requested actor:

```mermaid
sequenceDiagram

    actor Consumer
    participant ClusterContext
    participant IdentityLookup
    participant PidCache
    participant VirtualActor

    Consumer->>ClusterContext: RequestAsync
    loop Until response or timeout
        ClusterContext->>PidCache: GetPid
        PidCache-->>ClusterContext: PID
        rect rgba(0, 0, 0, 0.2)
            alt No hit in PidCache
                ClusterContext->>IdentityLookup: GetPid
                note right of IdentityLookup: "IdentityLookup implementation"
                IdentityLookup-->>ClusterContext: PID
            end
        end
        ClusterContext->>VirtualActor: Request
        VirtualActor-->>ClusterContext: Response
    end
    ClusterContext-->>Consumer: Response
```

In the case of a DB IdentityLookup, such as Redis or MongoDB, zooming into the implementation.
The following diagram shows how the information flows and when and if an actor needs to be spawned.

```mermaid
sequenceDiagram

    participant DBIdentityLookup
    participant PidCache
    participant DB
    participant MemberList
    participant Activator
    participant VirtualActor


    DBIdentityLookup->>DB: Get Placement Info
    DB-->>DBIdentityLookup: Placement Info

    alt Placement is missing
        DBIdentityLookup->>MemberList: GetActivator(kind)
        MemberList-->>DBIdentityLookup: Member info
        DBIdentityLookup->>Activator: ActivationRequest
        note right of Activator: Spawn the virtual actor<br>and return the PID
        Activator->>VirtualActor: Spawn
        Activator-->>DBIdentityLookup: ActivationResponse(PID)
        DBIdentityLookup->>DB: Store Placement Info
        DB-->>DBIdentityLookup:Stored
        DBIdentityLookup->>PidCache: Store PID
        PidCache-->>DBIdentityLookup: Stored
    end


```

## Async Semaphore

To avoid too many parallel calls to the database, that might potentially kill it or cause client timeouts, it can be needed to introduce a mechanism that limits concurrency. Proto.Actor has own implementation of [AsyncSemaphore](https://github.com/asynkron/protoactor-dotnet/blob/dev/src/Proto.Actor/Utils/AsyncSemaphore.cs#L12) that protects against that. DB storage implementations have a parameter that controls concurrency level.

## Redis implementaion

```csharp

static IIdentityLookup GetRedisIdentityLookup()
{
    var multiplexer = ConnectionMultiplexer.Connect(config["RedisAddress"]);
    var redisIdentityStorage = new RedisIdentityStorage("mycluster", multiplexer, maxConcurrency: 50);

    return new IdentityStorageLookup(redisIdentityStorage);
}

```

## Mongo implementation

```csharp

static IIdentityLookup GetMongoIdentityLookup()
{
    var db = GetMongo();
    var pidsCollection = db.GetCollection<PidLookupEntity>("pids");

    var identity = new IdentityStorageLookup(
        new MongoIdentityStorage("mycluster", pidsCollection, maxConcurrency: 200)
    );
    return identity;
}

```
