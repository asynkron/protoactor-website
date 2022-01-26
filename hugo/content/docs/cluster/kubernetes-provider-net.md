---
title: Kubernetes Provider (.NET)
---

# Kubernetes Provider (.NET)

If Proto.Actor application is planned to be deployed inside Kubernetes cluster, then this cluster membership provider is the best choice.

Below is the example how to configure it. The full working code might be found in [Realtime map example](https://github.com/asynkron/realtimemap-dotnet/blob/main/Backend/ProtoActorExtensions.cs#L17).

```csharp
(GrpcCoreRemoteConfig, IClusterProvider) ConfigureForKubernetes(IConfiguration config)
    {
        var kubernetes = new Kubernetes(KubernetesClientConfiguration.InClusterConfig());
        var clusterProvider = new KubernetesProvider(kubernetes);

        var host = config["ProtoActor:Host"] ?? "127.0.0.1";
        var port = TryParseInt(config["ProtoActor:Port"]) ?? 0;
        var advertisedHostname = config["ProtoActor:AdvertisedHost"];
        var advertisedPort = TryParseInt(config["ProtoActor:AdvertisedPort"]);

        var remoteConfig = GrpcCoreRemoteConfig
            .BindTo(host, port)
            .WithAdvertisedHost(advertisedHostname)
            .WithAdvertisedPort(advertisedPort)
            .WithProtoMessages(YourProtoGrainReflecion.Descriptor);

        return (remoteConfig, clusterProvider);

        int? TryParseInt(string? intAsString) =>
            string.IsNullOrEmpty(intAsString)
                ? null
                : int.Parse(intAsString);
    }

```

## Advertised Host

When running a Proto Cluster inside Kubernetes, there will be a local address on which the service is listening to, meaning the address inside the container, e.g. `0.0.0.0` in order to bind to all available network interfaces.

Your service will also have to expose an "Advertised Host", this is the address which is exposed to the other cluster members, the address that points to the specific Pod of a cluster member.

This can be retrieved the following way in your service definition:

```yml
env:
  - name: PROTO_PORT
    value: "8080"                  #this is the port we bind to
  - name: PROTO_HOST
    value: "0.0.0.0"               #this is the Host we bind to, inside the container
  - name: "PROTO_ADVERTISED_HOST"  #this is the Host we expose outwards, to the cluster
  - name: "PROTO_ADVERTISED_PORT"  #this is the Port exposed outwards, to the cluster
    valueFrom:
      fieldRef:
        fieldPath: status.podIP
```

## Role Definition

The service will also need some extra permissions inside Kubernetes in order to read and write metadata to its own Pods.
The role will need the following permissions:

```yml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: proto-cluster
rules:
  - apiGroups:
      - ""
    resources:
      - endpoints
      - pods
      - services
      - services/status
    verbs:
      - get
      - list
      - watch
      - patch
```

## Role Binding

```yml
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
    name: SomeServiceAccount #this is the service account that should have this role applied
```

## How it works?

Kubernetes provider registers a new member in the cluster by doing modification of labels connected with running pod. It adds information about cluster name, pod port, member id and all actor kinds supported by the node. Additionaly it spawns actor responsible for cluster monitoring. Monitor uses kubernetes api to receive updates about any pod change that runs in a namespace. Each such change is propagated by using gossip to all members.
