# Envelope Pattern

A common usecase for actor based event processing, is to comsume data from some form of queue or log such as Rabbit MQ or Kafka.

## How the pattern works

### Prefetch a batch of messages from the queue/log


### Group these messages based on the target actor


### Send the envelopes to the target actors


### Consume the envelopes in the actors


