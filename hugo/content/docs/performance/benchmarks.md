---
title: "Benchmarks"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

# Performance and Benchmarks

| Lib            |    Remote PingPong |      Inproc PingPong |    SkyNet |
| -------------- | -----------------: | -------------------: | --------: |
| Proto.Actor C# | ~8 500 000 msg/sec | ~125 000 000 msg/sec |  ~0.5 sec |
| Proto.Actor Go | ~5 400 000 msg/sec |  ~70 000 000 msg/sec |  ~1.2 sec |
| Akka.NET       |   ~350 000 msg/sec |  ~46 000 000 msg/sec |  ~4.5 sec |
| Erlang         |    ~200 000 msg/sc |  ~12 000 000 msg/sec | ~0.75 sec |

## Remote PingPong

This test uses two nodes and two actors, one on each node.
The test then pass 1 mil messages from node 1 to node 2 and back again.
There is no specific message size taken into account here, the message may be as small as
your framework supports.

## Inproc PingPong

This test is similar to the remote ping-pong, the difference is that there is a single node and
there may be more than two actors, usually CPU-Count or CPU-Count \* 2.
Messages may or may not be serialized. Both Proto.Actor and Akka.NET supports passing messages by reference
to optimize in-process performance.

## SkyNet

[https://github.com/atemerev/skynet]

Creates an actor (goroutine, whatever), which spawns 10 new actors, each of them spawns 10 more actors, etc. until one million actors are created on the final level. Then, each of them returns its ordinal number (from 0 to 999999), which are summed on the previous level and sent back upstream, until reaching the root actor. (The answer should be 499999500000).
