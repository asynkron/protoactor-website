# Lesson 8: What's a message in Proto.Actor.

So, now we understand a lot more about actors. Let's talk about messages.

The message is a simple class or record that allows you to describe the subject area and must not inherit from any parent class. It is also called POCO: plain, old CLR object.

An instance of the message class must be unchangeable. When you create an instance of the message class, you must make sure that it is not modified in the future. The easiest way to ensure this is to use records.

In most cases, sending messages is an asynchronous operation, meaning the actor sends a message to another actor and continues to do its work without waiting for the other actor to process the message.

The reactive programming manifesto says this about messages: a message is a data element sent to a specific address. In a message-based system, recipients wait for and react to messages or are waiting for messages. This behavior confirms the actor's laziness.

Let's look at an example of a message class written in C#.

```csharp
public sealed class ExampleMessage
{
    public int CustomerId { get; }

    public ExampleMessage(int customerId)
    {
        CustomerId = customerId;
    }
}
```



We see that we have a simple class. We do not inherit from the base class or implement any interfaces. 

Note that the `ExampleMessage` class has a constructor that takes the value `customerId`. When we create an instance of the `ExampleMessage` class, the constructor stores the passed value in the `CustomerId` property, but since it is read-only, no one else can modify the value, and we don't have to worry about someone destroying our business logic.

[Go ahead!](../lesson-9)