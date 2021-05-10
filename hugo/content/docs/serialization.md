# Serialization

> In computing, serialization is the process of translating a data structure or object state into a format that can be stored (for example, in a file or memory data buffer) or transmitted (for example, across a computer network) and reconstructed later (possibly in a different computer environment)

## Protobuf

### What are protocol buffers?

Protocol buffers are Google's language-neutral, platform-neutral, extensible mechanism for serializing structured data – think XML, but smaller, faster, and simpler. You define how you want your data to be structured once, then you can use special generated source code to easily write and read your structured data to and from a variety of data streams and using a variety of languages.


## Security

### "Magic Serializers"

The term "Magic Serializers" means serializers that heavily rely on reflection in order to serialize or deserialize whatever types are passed to them.

In the .NET space, the most known magic serializer is the now obsolete `BinaryFormatter`.

These types of serializers often write some form of "manifest" when serializing some user defined type.
This manifest often points to e.g. a fully qualified type name of the object that was serialized.

This is a security risk because an attacker, may pass a harmful payload, containing a typename that was not intended to be used for deserialization.

You can read more about this specific issue here:
[https://docs.microsoft.com/en-us/visualstudio/code-quality/ca2300?view=vs-2019](https://docs.microsoft.com/en-us/visualstudio/code-quality/ca2300?view=vs-2019)

From the description of the issue:

> BinaryFormatter is insecure and can't be made secure.

The same applies to all other "magic serializers".
If the serializer allows to create an instance of an arbitrary type based on a string name, this serializer is then insecure by definition, and should not be used.
