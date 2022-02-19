# Mermaid diagram tests

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Jonathan: Hello Jonathan, how are you?
    loop Healthcheck
        Jonathan->>Jonathan: Fight against hypochondria
    end
    Note right of Jonathan: Rational thoughts<br/>prevail...
    Jonathan-->>Alice: Great!
    Jonathan->>Bob: How about you?
    Bob-->>Jonathan: splendid!
```

## test test

```mermaid
  graph TD;
      DB[(Database)]
      class DB yellow
      BlockchainActor((Blockchain<br/>Actor))
      BlockActor((Block<br/>Actor))
      BlockVersionActor((Block<br/>Version<br/>Actor))
      BlockchainActor-->BlockchainState
      BlockchainActor-->BlockActor
      BlockActor-->BlockState
      BlockActor-->BlockVersionActor
      BlockVersionActor-->BlockVersionState
      BlockchainState-->DB
      BlockState-->DB
      BlockVersionState-.->DB
      BlockVersionState-.->BlockState
```

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
```

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

```mermaid
graph LR

l1(1)
class l1 message
l2(2)
class l2 message
l3(3)
class l3 message
l4(4)
class l4 message

r1(1)
class r1 message
r2(2)
class r2 message
r3(3)
class r3 message
r4(4)
class r4 message

Router(Router)
Routee1(Routee1)
Routee2(Routee2)
Routee3(Routee3)


l4---l3---l2---l1-->Router

Router---r4---r1-->Routee1
Router----r2-->Routee2
Router----r3-->Routee3


```
