---
title: Kubernetes Provider
---

# Kubernetes Provider

## MANDATORY READING!!

[Stop using CPU limits](https://home.robusta.dev/blog/stop-using-cpu-limits)

The essential configuration is CPU Requests combined with No CPU Limits. Deviating from this configuration results in CPU throttling, leading to gossip timeouts and associated issues.

This is not an issue specific to Proto.Actor; rather, it is a problem inherent to real-time systems within Kubernetes. Real-time systems cannot tolerate intermittent CPU pauses on nodes, as this unpredictably renders them unresponsive for undefined durations.

## Kubernetes Provider

If Proto.Actor application is planned to be deployed inside Kubernetes cluster, then this cluster membership provider is the best choice.

Below is the example how to configure it. The full working code might be found in [Realtime map example](https://github.com/asynkron/realtimemap-dotnet/blob/main/Backend/ProtoActorExtensions.cs#L17). The sample also contains a [Helm chart](https://github.com/asynkron/realtimemap-dotnet/tree/main/chart).

Provider is available in `Proto.Cluster.Kubernetes` NuGet package.

```csharp
(GrpcCoreRemoteConfig, IClusterProvider) ConfigureForKubernetes(IConfiguration config)
{
    var kubernetes = new Kubernetes(KubernetesClientConfiguration.InClusterConfig());
    var clusterProvider = new KubernetesProvider(kubernetes);

    var remoteConfig = GrpcNetRemoteConfig
        .BindToAllInterfaces(advertisedHost: config["ProtoActor:AdvertisedHost"])
        .WithProtoMessages(EmptyReflection.Descriptor)
        .WithProtoMessages(MessagesReflection.Descriptor)
        .WithLogLevelForDeserializationErrors(LogLevel.Critical)
        .WithRemoteDiagnostics(true);

    return (remoteConfig, clusterProvider);
}

```

## Advertised Host

When running a Proto Cluster inside Kubernetes, there will be a local address on which the service is listening to, meaning the address inside the container, e.g. `0.0.0.0` in order to bind to all available network interfaces.

Your service will also have to expose an "Advertised Host", this is the address which is exposed to the other cluster members, the address that points to the specific Pod of a cluster member.

This can be retrieved the following way in your service definition:

```yaml
apiVersion: apps/v1
kind: Deployment
# ...
spec:
  # ...
  template:
    # ...
    spec:
      # ...
      containers:
        # ...
        - env:
          - name: "ProtoActor__AdvertisedHost"  # this is the host we expose to other cluster members
            valueFrom:
              fieldRef:
                fieldPath: status.podIP
```

## Permissions

The application will also need some extra permissions inside Kubernetes in order to read and write metadata to its own Pods.
The role will need the following permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: proto-cluster
rules:
  - apiGroups:
      - ""
    resources:
      - pods
    verbs:
      - get
      - list
      - watch
      - patch
```

To bind the role to the deployment:


```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: proto-cluster
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: proto-cluster
subjects:
  - kind: ServiceAccount
    name: SomeServiceAccount # this is the service account that should have the role applied
```

```yaml
apiVersion: apps/v1
kind: Deployment
# ...
spec:
  # ...
  template:
    # ...
    spec:
      # ...
      serviceAccountName: SomeServiceAccount
```

## How it works?

Kubernetes provider registers a new member in a cluster by modifying labels on it's own pod. It adds information about cluster name, pod port, member id and all actor kinds supported by the node. Additionally it spawns the actor responsible for cluster monitoring. Monitor uses Kubernetes API to receive updates about any pod change that runs in a namespace. Each such change is propagated by using gossip to all members.
