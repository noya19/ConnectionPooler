# Connection Pooler

 - The aim of the project was to create a connection pooler from scratch using nodeJS. 

> **Database connection pooling** is a way to reduce the cost of opening and closing connections by maintaining a “pool” of open connections that can be passed from database operation to database operation as needed. This way, we are spared the expense of having to open and close a brand new connection for each operation the database is asked to perform.

    poolOptions {
	    maxPoolSize: 5,
	    mode: "lazy"
    }
    
- When creating a connection we can provide two options, **maxPoolSize** which is the maximum no. of connection to a database that can be made, **mode** which is the way connections are created:
	- "eager": upon initialization of the pool, all the connections uptill the maxPoolSize will be created. 
	- "lazy": upon initialization of the pool, the pool will be empty, on subsequent requests for a connection, a new connection will be created, but only till the maxPoolSize, after which, the connections will be provided in a round robin fashion from the pool.

- Tried to implement proper principles while coding, for example, -
	- **Dependency Inversion** is followed for the connectionPool, i.e. the pool is not dependant on a particular type of connection. It uses the predifiend methods of an AbstractConnector. The internal implementation for which are different for different connectors.
	Also, it request a connection from a Connection Factory where different connectors can be injected. Hence **Factory Pattern** can also be seen here.
	
	- **Dependecy Injection** is followed since, different database connectors/clients can be injected to the Connection. All the connectors just need to implement the given methods of the "AbstractConnector".
Dependecy Injection allows for easier test as Mock Connectors can be injected.

	 
