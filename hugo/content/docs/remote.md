# Proto.Remote

## Introduction
One of the main modules in the Proto.Actor platform is the Proto.Remote. This module provides an opportunity to build a network distributed system of actors, in order to scale your system, making use of gRPC streaming.

### Key features of Proto.Remote.

- Location transparency - Thanks to the fact that the Proto.Actor platform uses PIDs for process identification. Your code will look the same regardless of whether it works with a local or remote process. Thus, the location of the actor you are interacting with is completely transparent to your code.

- Remote deployment - Everything you need to interact with a remote actor located anywhere in the world. It is to create a new PID and specify its IP address and ID. 

  ```csharp
  var server = new PID("127.0.0.1:8000", "chatserver");
  ```

- Using gRPC as an inter-service communication protocol - Allows you to combine actor systems written in different programming languages. Besides, gRPC can accelerate the productivity and efficiency of the microservice architecture many times by taking full responsibility for maintaining the communication channel between actor systems and data transfer.
