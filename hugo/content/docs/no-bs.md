# Proto.Actor, the No BS introduction.

## Actors

Actors are an alternative concurrency model.
.NET has Tasks and channels. Go has Goroutines and channels.

Actors are yet another way to deal with concurrency.

### Why not just use channels?

While channels are similar in the sense that they are queue-like, you post data to them, and someone pulls that data out on the other end and does something.
Actors do the same, where the "channel" is called a "mailbox".

But, actors also introduce other features, lacking from raw channels.
e.g. Actors have Supervision, Observability, Distributed computing.