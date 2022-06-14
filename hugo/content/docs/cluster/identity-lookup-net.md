---
layout: docs.hbs
title: Identity Lookup (.NET)
---

# Identity Lookup (.NET)


Identity lookup allows the Proto.Cluster to use different strategies to locate virtual actors. 

```mermaid
sequenceDiagram
    participant Device as device-123 <br/> on member-5

    Client ->> PidCache: where is the device-123 actor located?
    PidCache -->> Client: it's on member-5

    alt Entry in PidCache not found 
        Client ->> IdentityLookup: where is the device-123 actor located?
        IdentityLookup ->> IdentityLookup: ok, found it
        IdentityLookup -->> Client: it's on member-5
    end
    Client ->> Device: here's a message for you
```

If the actor is not activated yet, it will be activated according to the [member strategy](member-strategies.md).

```mermaid
sequenceDiagram
    participant Device as device-123 <br/> on member-5

    Client ->> IdentityLookup: where is the device-123 actor located?
    IdentityLookup ->> IdentityLookup: it's not activated yet
    IdentityLookup ->> MemberStrategy: where do I activate a device?
    MemberStrategy -->> IdentityLookup: try member-5
    IdentityLookup ->> Device: activate

    IdentityLookup -->> Client: it's on member-5
    Client ->> Device: here's a message for you
```

 Depending on the use case, different strategy will be suitable.

* [Partition Identity Lookup](partition-idenity-lookup.md) - the actor locations are partitioned and stored in memory. Each cluster member is responsible for a single partition. Use this implementation if you are unsure what fits your use case.

* [DB Identity Lookup](db-identity-lookup.md) - implementation based on an external database that stores all the actor locations.

* [Partition Activator Lookup (Experimental)](partition-activator-lookup.md) - implementation based on consistent hashing. Location is assigned by the hash function, member strategy is ignored.