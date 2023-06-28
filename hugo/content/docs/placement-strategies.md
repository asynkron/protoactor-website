---
title: Placement Strategies
---

# Cluster placement patterns

## How do I make an actor that:

### Is unique for a given ID

This strategy involves using a virtual actor with a unique identifier (ID) as part of its name. This ensures that each actor is unique and can be individually addressed within the cluster. This strategy is typically used when you need to maintain a unique instance of an actor for each entity in your system.

```mermaid
graph TB

    a1((Player1))
    a2((Player5))
    b1((Player7))
    b2((Player9))
    c1((Player3))
    c2((Player6))
    d1((Player2))
    d2((Player4))

    subgraph Member1
        a1
        a2
    end
    subgraph Member 2
        b1
        b2
    end
    subgraph Member 3
        c1
        c2
    end
    subgraph Member 4
        d1
        d2
    end

    a1-->a2
    b1-->b2
    c1-->c2
    d1-->d2
    linkStyle default display:none;
```

**Use-case:** e.g. Players, monsters, user accounts .

### Is a cluster singleton

Use a virtual actor with a known name.

```mermaid
graph TD

    s((Singleton))

    subgraph Member 1
        empty1
    end
    subgraph Member 2
        empty2
    end
    subgraph Member 3
        s
    end
    subgraph Member 4
        empty3
    end
```

**Use-case:** e.g. a manager actor of some sort, that manages work for the entire cluster.

### Always exist on each member

Use a normal actor, boot on startup.
Use MemberList to see what members exist when communicating with these actors.

```mermaid
graph TB

    a1((Worker1))

    b1((Worker2))

    c1((Worker3))

    d1((Worker4))

    subgraph Member 1
        a1
    end
    subgraph Member 2
        b1
    end
    subgraph Member 3
        c1
    end
    subgraph Member 4
        d1
    end
```

**Use-case:** e.g. a worker actor that performs maintenance work for each cluster member.
