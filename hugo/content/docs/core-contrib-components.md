---
layout: docs.hbs
title: Core vs contrib components of Proto.Actor
---

# Core vs contrib components of Proto.Actor

Proto.Actor comes with a lot of components, some of them containing core functionality, and others being extensions provided by the community. For simplicity, we keep all of the code in a single solution with an uniform CI process. This means, that all the packages are released with the same version number. However, the level of support is different.

* **Core** - maintained by the core contributors of Proto.Actor. Actively developed and modernized.
* **Contrib** - we make sure that the code compiles and existing tests pass. We rely on community contributions for improvements.
* **Experimental** - new and experimental functionality, alpha or beta status.
* **Deprecated** - removed from the solution or not maintained. Packages are still listed on NuGet for applications using older Proto.Actor versions.

| Name                           | Core | Contrib | Experimental | Deprecated |
|--------------------------------|:----:|:-------:|:------------:|:----------:|
| Proto.Actor                    |  ●   |         |              |            |
| Proto.Cluster                  |  ●   |         |              |            |
| Proto.Cluster.AmazonECS        |      |    ●    |              |            |
| Proto.Cluster.CodeGen          |  ●   |         |              |            |
| Proto.Cluster.Consul           |      |    ●    |              |            |
| Proto.Cluster.Dashboard        |      |         |      ●       |            |
| Proto.Cluster.Identity.MongoDb |      |    ●    |              |            |
| Proto.Cluster.Identity.Redis   |  ●   |         |              |            |
| Proto.Cluster.Kubernetes       |  ●   |         |              |            |
| Proto.Cluster.TestProvider     |  ●   |         |              |            |
| Proto.OpenTelemetry            |  ●   |         |              |            |
| Proto.OpenTracing              |      |         |              |     ●      |
| Proto.Persistence              |  ●   |         |              |            |
| Proto.Persistence.Couchbase    |      |    ●    |              |            |
| Proto.Persistence.DynamoDB     |      |    ●    |              |            |
| Proto.Persistence.Marten       |      |    ●    |              |            |
| Proto.Persistence.MongoDB      |      |    ●    |              |            |
| Proto.Persistence.RavenDB      |      |    ●    |              |            |
| Proto.Persistence.Sqlite       |      |    ●    |              |            |
| Proto.Persistence.SqlServer    |      |    ●    |              |            |
| Proto.Remote                   |  ●   |         |              |            |
| Proto.Remote.GrpcCore          |      |         |              |     ●      |
