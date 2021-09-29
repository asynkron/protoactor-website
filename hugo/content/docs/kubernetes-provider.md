# Kubernetes Provider




## Advertised Host

When running a Proto Cluster inside Kubernetes, there will be a local address on which the service is listening to, meaning the address inside the container.
e.g. `0.0.0.0` in order to bind to all available network interfaces.

Your service will also have to expose an "Advertised Host", this is the address which is exposed to the other cluster members, the address that points to the specific Pod of a cluster member.

This can be retreived the following way in your service definition:

```yml
env:
  - name: PROTOPORT
    value: "8080"            //this is the port we bind to
  - name: PROTOHOST
    value: "0.0.0.0"         //this is the Host we bind to, inside the container
  - name: "ADVERTISED_HOST"  //this is the Host we expose outwards, to the cluster
    valueFrom:
      fieldRef:
        fieldPath: status.podIP
```                 

## Role Bindings

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
