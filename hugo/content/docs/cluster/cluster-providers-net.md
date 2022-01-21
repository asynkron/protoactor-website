---
layout: docs.hbs
title: Cluster providers (.NET)
---

# Cluster Providers (.NET)

what is a cluster provider and why proto.actor uses it

proto.actor philosophy - why reinvent the wheel? use something tested and proven in battle


todo: split into sections, rather than a list?
todo: code

- ##### Self Managed Provider - use this for local development.
- ##### Kubernetes Provider - a go-to solution if you're hosting your cluster in Kubernetes; read more about [deploying to Kubernetes](kubernetes-deployment-net.md).
- ##### Consul Provider - a great choice if you're not hosting your cluster on Kubernets (but e.g. on VMs); also works great if you want to setup a local, development cluster for testing.
- ##### AWS ECS Provider
- ##### Etcd Provider
- ##### Zookeeper Provider

...

### `IClusterProvider` - extension point

This allows the membership logic to be replaced.