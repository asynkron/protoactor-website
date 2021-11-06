# Envelope Pattern

## Batching in event-driven architectures

A common use-case for actor-based event processing is to consume data from some form of queue or log, such as Rabbit MQ or Kafka.

If you use some form of persistence in your event processor, be it plain snapshots of state or event-sourcing, this can result in writes to the database for each message processed.
One message goes in, you process it, you write the new state of your entity/actor back to the persistent store.

This can result in bottlenecks in terms of writes against the persistent store.
e.g. if you process 10 000 messages per second, that could result in 10 000 writes to the persistent store.

This pattern limits the number of writes to the persistent store by grouping messages together, where you only write back once they are all processed, and then ack this back to the underlying message queue/log you are using.


Requires:
* Idempotency, message deduplication in actor

Pros:
* High throughput processing
* Guaranteed delivery of messages (at least once)
* Guaranteed state persistence

Cons:
* Higher latency due to batching
* Idempotency state and logic can add complexity


## How the pattern works

### Prefetch a batch of messages from the queue/log

![Cluster Events](images/batching-0.png)

### Group these messages based on the target actor

![Cluster Events](images/batching-1.png)

### Construct the Envelope messages

![Cluster Events](images/batching-2.png)

### Send the envelopes to the target actors

![Cluster Events](images/batching-3.png)

### Consume the envelopes in the actors

At this point, we process each message in the envelope, but we only commit state back to our persistent store once we have processed all of the content.

This strategy allows us to process messages at high throughput, while still guaranteeing persistence.

![Cluster Events](images/batching-4.png)

### Await Ack and commit offsets

Once all envelopes are processed for all actors, we commit the highest offsets for each key or partition depending on what queue/log technology we are using.

![Cluster Events](images/batching-5.png)
