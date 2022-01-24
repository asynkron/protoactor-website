---
layout: docs.hbs
title: Cluster providers (.NET)
---

# Cluster Providers (.NET)

Cluster provider is an abstraction that provides an information about currently available members (nodes) in a cluster. Together with [gossip protocol strategy](gossip.md), it allows to resign from any leader-follower concepts in the clustering code.

Interface `IClusterProvider` have 2 main functions:

* Start (join) member to a cluster
* Shutdown 

Proto.actor continues philosophy of not reinventing the wheel again, so it is possible to choose between one of already battle tested compontents that could save and share information about membership in a cluster.

Available providers:

* [Kubernetes Provider](kubernetes-provider-net.md)
* [Consul Provider](consul-net.md)
* [Amazon ECS Provider](aws-provider-net.md)
* [Test Provider](test-provider-net.md)
* ETCD Provier TODO
* Zookeeper Provider TODO
* Self Managed Provider - your own implementaion of `IClusterProvider` interface