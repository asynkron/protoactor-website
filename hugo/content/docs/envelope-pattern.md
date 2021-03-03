# Envelope Pattern

## Batching in event-driven architectures

A common usecase for actor based event processing, is to comsume data from some form of queue or log, such as Rabbit MQ or Kafka.

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

This allows us to process large number of messages at high throughput, while still guaranteeing persistence.

![Cluster Events](images/batching-4.png)

### Await Ack and commit offsets

Once all envelopes are processed for all actors, we commit the highest offsets for each key or partition depending on what queue/log technology we are using.

![Cluster Events](images/batching-5.png)