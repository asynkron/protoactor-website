---
title: Processes
---

# Actor, Process, PIDs, what does it mean?

Some terminology comes from Erlang and some from Carl Hewitts paper on the actor model.

First, a process in Erlang, is not the same as an OS process.
An OS process, is generally a service or application running on your machine, that is, the entire thing.

Stopping this process means that the entire service or application stops.

A process in the Erlang world, a process is an isolated unit of computation, an Erlang system is generally built out of thousands of Erlang processes.

Erlang pioneered the "Let it crash" model, meaning, if one of these small units of computation crashes, the error can be handled out of bounds.

