# Messaging Patterns

```mermaid
graph LR

message(MSG)
class message message
router(Router)
class router yellow
message2(MSG)
class message2 message
message3(MSG)
class message3 message
queue([Queue])
class queue queue

subgraph r[Router]
    router
end

message --> router

router ---> message2
router ---> message3
router ---> queue

```
