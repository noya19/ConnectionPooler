import { AbstractConnection } from "../connection/abstract_connector/index";
import { randomJitter } from "../util/random_jitter";
import { timeout } from "../util/timeout";
import { AbstractConnectionPool } from "./abstract_connection_pool/index";
import { poolOptions } from "./types";
import { ConnectionFactory } from "../connection/connectionFactory";
import { resultifyAsync } from "../util/result";

export interface ConnectionConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export class ConnectionPool extends AbstractConnectionPool {
    private pool: AbstractConnection[] = [];
    private maxPoolSize: number;
    private mode: "eager" | "lazy";
    private currentPoolIndex: number = 0;
    private client: ConnectionFactory
    private maxRetries: number = 0;

    constructor(
        poolOptions: poolOptions,
        client: ConnectionFactory
    ) {
        super();
        this.maxPoolSize = poolOptions.maxPoolSize;
        this.mode = poolOptions.mode ? poolOptions.mode : 'lazy';
        this.client = client
        this.maxRetries = poolOptions.maxRetries ? poolOptions.maxRetries : 0
    }

    async createConnection(maxRetries: number = 4): Promise<AbstractConnection> {
        const createConn = resultifyAsync(this.client.createConnection.bind(this.client));
        const [result, error] = await createConn();
        if (error) {
            console.error(error);
            if (maxRetries === 0) {
                throw error;
            }
            console.log("Retrying.....", maxRetries);
            const time = randomJitter(50, 1000);
            await timeout(time);
            return await this.createConnection(maxRetries - 1);
        }
        return result;
    }

    async getConnection(): Promise<AbstractConnection> {
        if (this.mode === "eager" && this.pool.length === 0) {
            for (let i = 0; i < this.maxPoolSize; i++) {
                const createConn = resultifyAsync(this.createConnection.bind(this));
                const [connection, error] = await createConn(this.maxRetries);
                if (error) {
                    throw error;
                }
                this.pool.push(connection);
            }
        }

        if (this.pool.length < this.maxPoolSize) {
            const createConn = resultifyAsync(this.createConnection.bind(this));
            const [connection, error] = await createConn();
            if (error) {
                throw error;
            }

            this.pool.push(connection);
            this.currentPoolIndex = this.pool.length - 1;
            // console.log(`The Client provided was -> ${this.currentPoolIndex}`);

            this.currentPoolIndex++;
            return connection;
        } else {
            //1. check if index is >= max and update it to correct idx.
            this.currentPoolIndex =
                this.currentPoolIndex >= this.maxPoolSize
                    ? this.currentPoolIndex % this.maxPoolSize
                    : this.currentPoolIndex;
            const con = this.pool[this.currentPoolIndex];

            //2. check if the connection is healthy, if not replace the connection with a new one.
            const isExpired = await con.isExpired();
            if (isExpired) {
                console.log(
                    "Something went wrong while assigning a connection, Retrying.."
                );
                this.pool = this.pool.filter((_, idx) => {
                    return idx !== this.currentPoolIndex;
                });
                return await this.getConnection();
            }

            //3.Renew lease Time.
            con.renewLeaseTime();

            //4. increase the index and return the client.
            this.currentPoolIndex++;
            return con;
        }
    }

    private async cleanUpUtil() {
        for (let i = 0; i < this.pool.length; i++) {
            const connection = this.pool[i];
            if (!connection.getIsBusy() && Date.now() > connection.getLeaseTime()) {
                await connection.close();
            }
        }
    }

    async cleanup() {
        await this.cleanUpUtil();
        this.pool = this.pool.filter((conn) => {
            return Date.now() < conn.getLeaseTime();
        });

        console.log(
            "Updated Pool of Connections ( length of pool )",
            this.pool.length
        );
    }

    async end() {
        while (this.pool.length > 0) {
            const conn = this.pool.pop();
            await conn?.close();
        }
        console.log("The Pool was deleted");
    }

    stats() {
        return {
            totalConnections: this.pool.length,
        };
    }

    async execute<U>(statement: string): Promise<U> {
        const connection = await this.getConnection();
        const resolve = resultifyAsync(connection.execute.bind(connection));
        const [result, error] = await resolve(statement);
        if (error) {
            throw error;
        }
        return result as U;
    }
}
