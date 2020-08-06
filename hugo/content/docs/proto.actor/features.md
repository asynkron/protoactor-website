---
title: "Features"
date: 2020-05-28T16:34:24+02:00
draft: false
tags: [protoactor, docs]
---

## Actor

### Features

- Create actor from function/method
- Create actor from object factory
- Spawn actor with automatic/prefixed/specific name

## Props

### Settings

- Actor producer
- Mailbox producer
- Supervisor strategy
- Dispatcher
- Actor spawner
- Middleware

## Context

### Data

- Parent PID
- Self PID
- Sender PID
- Children PIDs
- Current message
- Current Actor

### Features

- Respond to sender
- Stash current message pending restart
- Spawn child actor with automatic/prefixed/specific name
- Stop/restart/resume children
- Set/push/pop actor behaviors (become/unbecome)
- Watch/unwatch actors
- Receive timeout 

## ProcessRegistry

- Get Process by PID
- Add local Process with ID
- Remove Process by PID
- Generate next Process ID

## Process

- Send user message to Process
- Send system message to Process
- Stop Process

## Supervision

### Directives

- Resume
- Restart
- Stop
- Escalate

### Strategies

- OneForOneStrategy applies directive to failed child

## PID

### Features

- Holds address (nonhost or remote address) and ID
- Send user message
- Send system message
- Request
- Request future
- Stop

## Future process

- Auxiliary process used to provide an awaitable future containing the response to a request

## Dead letter process

- Auxiliary process used to collect messages sent to non-existing processes

## Routers

- Group routers route message to a specified set of routees
- Pool routers route messages to a set of routees of a specified size, and are created/managed by the router
- Broadcast routers routes a message to all routees
- Random routers routes a message to a random routee
- Consistent-hash routers routes a message to a routee deterministically
- Round-robin routers routes messages to routees in a round-robin fashion

### Consistent hash routers

- Routing is deterministic based on a hash computed by the message
- Uses a hash ring so that if a routee is unavailable, another will be chosen automatically, and when the routee is back it will be used again

### Broadcast routers

- Uses a special message RouterBroadcastMessage to route messages more efficiently when the routees are remote (?)

### Management messages

- Add route
- Get routees
- Remove routee

## Remote

- Remote.Start() starts a remote actor server on a given address
- RemoteProcess represents an actor on a remote actor server
- Remote actors can be watched
- EndpointWriter mailbox collects batches of messages to optimize sending