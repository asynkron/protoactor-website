# Context Decorator

Context Decorators allow developers to surround actors with custom functionality, this could be anything from custom message receive logic, to intercepting outgoing calls from the context.

For example the `OpenTracing` plugin is built using this mechanism.

To apply context decorators to an actor, use the `Props.WithContextDecorator` method.

## Conceptual overview

This overview aims to show how the different extension points of Proto.Actor interact together.


![Context Decorator](images/middleware.png)