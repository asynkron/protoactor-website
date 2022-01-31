---
title: Seed Node Cluster Provider (.NET)
---

# Seed Node Cluster Provider 

## REMARK Still experimental

This implementaion doesn't require any third party components to start the cluster. All the topology changes are distributed using gossip.

The only requirement of this is that the first member address needs to be passed as a configuration or resolved by using, e.g. DNS. The rest of cluster members will be discovered using gossip.