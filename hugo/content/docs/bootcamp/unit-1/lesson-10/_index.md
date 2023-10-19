# Lesson 10: Overview of the supervisor hierarchy in Proto.Actor.

One of the most critical aspects of Proto.Actor is the ability of actors to observe other actors. We saw earlier that an actor could have multiple child actors. If an actor has child actors, the parent actor must monitor the status of child actors. 

Thus, actors form a hierarchy. We have parent actors who watch over child actors. The child actors can also have their children. This hierarchy of actors allows you to create fault-tolerant systems and also allows the system to restore itself. 

The self-recovery is a system feature that allows you to determine that a problem has occurred and automatically fix it without the help of the outside world or the system administrator. 

For example, if an actor fails, its parent actors will be notified, and then the parent actor must decide how to process the error that happened to its child actor.

There are several different strategies that parent actors can use to deal with a child actor's failure. 

One strategy is to restart the actor from its initial state. There may be situations where the parent actor does not know what to do and cannot fix the child actor's error. In this case, the parent actor may message its parent actor that it does not know what to do about the bug from the child's lower-level actor and ask the parent for help.

![](../../images/1_10_1.gif)

A critical concept of the actor observation hierarchy is that we can pass more risky or error-prone work to the lower level so that child actors in the lower level do all the unsafe work. 

If this risky work causes any error, it will affect only this actor. The parent actors of this actor will not be affected and will not lose their inner state if their child actors fail.

The supervisor hierarchy allows the system not only to handle errors but also to self-repair. 

[Go ahead!](../lesson-11)