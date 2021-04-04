# Proto.Util.AsyncSemaphore


`AsyncSemaphore` is a utility type that helps limit the number of concurrent usages of a given resource.
eg. limit the number of concurrent requests to a database.

This is especially useful for actor systems, where a cold-start of a system might bring thousands of actors back to life.
If you were to allow all these actors to individually request a database, the database could easily become overloaded.

Using a semaphore for this is one way to deal with this problem.

## Example code using Redis

```csharp
var maxConcurrency = 10;
var semaphore = new AsyncSemaphore(maxConcurrency);
var multiplexer = ConnectionMultiplexer.Connect("localhost:6379");
var db = multiplexer.GetDatabase();

// ...
// code that concurrently reads from redis 
// this might be inside a component called from within an actor
// ..or any other concurrent data flow
var res = 
    await semaphore.WaitAsync( async () => 
        //we are guaranteed to have max `maxConcurrency` concurrent calls here
        await db.StringGetAsync("some key"));

```

Related:
For other approaches to deal with similar problems, see [Collective reads and writes](collective-access.md)
