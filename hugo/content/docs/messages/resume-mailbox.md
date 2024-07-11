
# SuspendMailbox and ResumeMailbox Messages

This guide explains the `SuspendMailbox` and `ResumeMailbox` messages in Proto.Actor. These are system-level messages used to manage the state of an actor's mailbox.

## SuspendMailbox

The `SuspendMailbox` message is a built-in system message in Proto.Actor used to suspend an actor's mailbox. When an actor receives a `SuspendMailbox` message, the actor's mailbox is paused, preventing it from processing any further messages until it is resumed. This can be useful for temporarily halting an actor's operations while a supervisor decides what action to take.

## ResumeMailbox

The `ResumeMailbox` message is a built-in system message in Proto.Actor used to resume an actor's mailbox that has been previously suspended. When an actor receives a `ResumeMailbox` message, the actor's mailbox is resumed, allowing it to continue processing messages. This typically occurs after the supervisor has made a decision regarding the actor's state.

## Use Cases

These messages are primarily used for supervision purposes:

- **Supervision Control**: Temporarily suspending an actor's mailbox while the supervisor evaluates and decides the appropriate action (e.g., restart, stop, escalate).

### Note to Users

These messages are system-level constructs and are not intended for direct interaction by users. They are managed internally by the Proto.Actor framework to ensure proper supervision and stability of actor operations.

## Conclusion

By utilizing the `SuspendMailbox` and `ResumeMailbox` messages, the Proto.Actor framework can effectively manage the state of an actor's mailbox during supervision, providing robust control over message processing and actor lifecycle management.
