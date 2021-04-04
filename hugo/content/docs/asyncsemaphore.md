# Proto.Util.AsyncSemaphore

`AsyncSemaphore` helps limit the number of concurrent usages of a given resource.
eg. limit the number of concurrent requests to a database

```csharp
var maxConcurrency = 10;
var semaphore = new AsyncSemaphore(maxConcurrency);
var multiplexer = ConnectionMultiplexer.Connect("localhost:6379");
var db = multiplexer.GetDatabase();

//...
//code that concurrently reads from redis 
var res = 
    await semaphore.WaitAsync( async () => 
        //we are guaranteed to have max `maxConcurrency` concurrent calls here
        await db.StringGetAsync("some key"));

```
