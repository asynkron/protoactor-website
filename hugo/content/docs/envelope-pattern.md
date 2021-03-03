# Envelope Pattern

A common usecase for actor based event processing, is to comsume data from some form of queue or log, such as Rabbit MQ or Kafka.

## How the pattern works

### Prefetch a batch of messages from the queue/log

![Cluster Events](images/batching-1.png)


### Group these messages based on the target actor

![Cluster Events](images/batching-2.png)

### Send the envelopes to the target actors

![Cluster Events](images/batching-3.png)

### Consume the envelopes in the actors

![Cluster Events](images/batching-4.png)

### Await Ack and commit offsets

![Cluster Events](images/batching-5.png)