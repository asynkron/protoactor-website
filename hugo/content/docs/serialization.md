---
title: Serialization
---

# Serialization

> In computing, serialization is the process of translating a data structure or object state into a format that can be stored (for example, in a file or memory data buffer) or transmitted (for example, across a computer network) and reconstructed later (possibly in a different computer environment)

## Protobuf

### What are protocol buffers?

Protocol buffers, or Protobuf for short, are Google's language-neutral, platform-neutral, extensible mechanism for serializing structured data – think XML, but smaller, faster, and simpler. You define how you want your data to be structured once, then you can use special generated source code to easily write and read your structured data to and from a variety of data streams and using a variety of languages.

## Security

### Harmful "Magic Serializers"

The term _"Magic Serializers"_ means serializers that heavily rely on reflection in order to serialize or deserialize whatever types are passed to them.

In the .NET space, the most known magic serializer is the now obsolete `BinaryFormatter`.

These types of serializers often write some form of "manifest" when serializing some user defined type.
This manifest often points to e.g. a fully qualified type name of the object that was serialized.

**This opens up an attack vector into systems using those serializers, as an attacker may pass a harmful payload, containing a type-name that was not intended to be used for deserialization.**

You can read more about this specific issue here:
[https://docs.microsoft.com/en-us/visualstudio/code-quality/ca2300?view=vs-2019](https://docs.microsoft.com/en-us/visualstudio/code-quality/ca2300?view=vs-2019)

From the description of the issue:

> BinaryFormatter is insecure and can't be made secure.

The same applies to all other **"magic serializers"**.
If the serializer allows to create an instance of an arbitrary type based on a string name, this serializer is then insecure by definition, and should not be used.

Other offenders are Json.NET when `TypeNameHandling` is set to something other than `None`.

Our own serializer **Wire**, discontinued for this reason.
And the **AkkaDotNet/Hyperion** fork of Wire.

**Github issued Security advisory: [Wire/security/advisories/GHSA-hpw7-3vq3-mmv6](https://github.com/asynkron/Wire/security/advisories/GHSA-hpw7-3vq3-mmv6)**

## Useful links

An excellent talk on this subject can be found here:

[Attacking .NET deserialization - Alvaro Muñoz](https://www.youtube.com/watch?v=eDfGpu3iE4Q&ab_channel=Scrtinsomnihack)
