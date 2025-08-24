# Chapter 1: Virtual Actors

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

[Back to Chapter 1](../)

A virtual actor (or grain, in Proto.Actor terminology) is a concept used in distributed clusters (inspired by Microsoft Orleans). Virtual actors abstract away the manual creation and placement of actors in a cluster. Instead of explicitly spawning an actor on a specific node, you simply send a message to a cluster identity (a logical name for the actor), and the cluster ensures an actor instance exists to receive that message.

The first time a message is sent to a given identity (e.g., "user/123"), Proto.Actor’s cluster will automatically activate an actor for that identity on an available node. This actor is kept alive to process subsequent messages, and if the hosting node goes down, the cluster can transparently recreate the actor on another node. We will delve into virtual actors in the cluster chapter, but it’s important to know that Proto.Actor supports both traditional actor usage (where you manage actor lifecycles in your process) and virtual actors (where the cluster manages lifecycles for you).

**Chapters:** [1](../chapter-1/) | [2](../chapter-2/) | [3](../chapter-3/) | [4](../chapter-4/) | [5](../chapter-5/)

