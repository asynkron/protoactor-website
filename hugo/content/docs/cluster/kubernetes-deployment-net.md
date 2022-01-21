---
title: Kubernetes Deployment (.NET)
---

TODO: add code

# Kubernetes Deployment (.NET)

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
