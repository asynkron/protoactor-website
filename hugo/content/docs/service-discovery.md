---
title: "Service Discovery"
date: 2025-08-09T00:00:00Z
draft: false
tags: [protoactor, docs]
---
# Service Discovery

Service discovery allows nodes to find each other without hardcoded addresses. In dynamic environments like containers or cloud deployments, discovery is essential to keep clusters connected.

## Approaches
- **DNS or static lists** – simple but inflexible.
- **Central registries** – systems such as Consul, etcd or Kubernetes APIs track active members.
- **Gossip protocols** – nodes exchange membership information peer‑to‑peer.

## Service Discovery in Proto.Actor
Proto.Actor's cluster providers use these approaches under the hood. For example the Kubernetes provider queries the API server, while the Consul provider registers each member in Consul's catalog.

## Recommendations
Choose a discovery mechanism that matches your infrastructure. In cloud deployments rely on the platform's registry; in smaller setups a lightweight gossip or static list may be sufficient.
