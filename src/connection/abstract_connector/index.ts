export abstract class AbstractConnection {
    /**
     * @description It establish a database connection of a given database connector.
     */
    abstract connect(): Promise<void>;
    /**
     * @description It executes a SQL statement on the given database connector.
     * @param statement A SQL statement
     */
    abstract execute<T>(statement: string): Promise<T | T[]>;

    /**
     * @description It closes the database connection.
     */
    abstract close(): Promise<void>;
    /**
     * @description It checks if the connection is expired.
     */
    abstract isExpired(): Promise<boolean>;
    /**
     * @description checks if connection is busy
     */
    abstract getIsBusy(): boolean;
    /**
     * @description returns the Lease time of the connection
     */
    abstract getLeaseTime(): number;
    /**
     * @description It renews the lease time whenever a the connection is used.
     */
    abstract renewLeaseTime(): void;
}
