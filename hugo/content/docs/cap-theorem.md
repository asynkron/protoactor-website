---
title: "CAP Theorem"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# CAP Theorem

The CAP theorem states that in the presence of a network partition a distributed system can provide either consistency or availability, but not both simultaneously.

## Consistency
Reads return the most recent write. Choosing consistency often requires coordination and may lead to unavailability if partitions occur.

## Availability
Every request receives a response, even if it may not be the latest data. Systems that favor availability handle partitions by serving stale data and reconciling later.

## Partition Tolerance
Network failures happen. Proto.Actor embraces this by allowing actors to recover, replay events and rebuild state when partitions heal.

## Working with CAP in Proto.Actor
Proto.Actor does not dictate where you land on the CAP spectrum. Instead it provides primitives—like persistence, clustering and message passing—so you can build systems that choose consistency or availability depending on business requirements.
