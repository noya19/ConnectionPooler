import { AbstractConnection } from "../../connection/abstract_connector";

export abstract class AbstractConnectionPool {
    /**
     * @description It creates the database connections and store them in the pool.
     */
    abstract createConnection(): void;
    /**
     * @description It returns a connection in round-robin fashion.
     *
     * @example
     * ```
     * const pool = new ConnectionPool();
     * const con = await pool.getConnection();
     * const res = await con.execute("SELECT firstName, lastName, age FROM SYS.CUSTOMERS");
     * ```
     */
    abstract getConnection(): Promise<AbstractConnection>;

    /**
     * @description Perform cleanup operation inside the Pool.
     *  If a connection is going to expire, it will force close the connection and pop of connection pool.
     * @example
     * ```
     * const pool = new ConnectionPool();
     * const con = await pool.getConnection();
     * const res = await con.execute("SELECT firstName, lastName, age FROM SYS.CUSTOMERS");
     * pool.cleanup();
     * ```
     */
    abstract cleanup(): void;

    /**
     * @description closes all the connections available in the pool.
     * @example
     * ```
     * const pool = new ConnectionPool();
     * const con = await pool.getConnection();
     * const res = await con.execute("SELECT firstName, lastName, age FROM SYS.CUSTOMERS");
     * pool.end()
     * ```
     */
    abstract end(): void;

    /**
     * @description It returns the statistic of the Connection pool.
     *  - total number of connection
     *  - total number connection request
     */
    abstract stats(): { totalConnections: number };

    /**
     * @description It execute a SQL statement.
     * @param statement SQL statement.
     * @example
     * ```ts
     * const pool = new ConnectionPool();
     * const con = await pool.getConnection();
     * const res = await con.execute("SELECT firstName, lastName, age FROM SYS.CUSTOMERS");
     * ```
     */
    abstract execute<T>(statement: string): Promise<T>;
}
