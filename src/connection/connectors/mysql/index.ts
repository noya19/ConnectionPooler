import * as mysql from "mysql2/promise";
import { AbstractConnection } from "../../abstract_connector";
import { idGenerator } from "../../../util/id_generator";

interface ConnectionConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

interface Options {
    leaseTime?: number;
}

export class mysqlConnection extends AbstractConnection {
    private client!: mysql.Connection;
    private leaseTime!: number;
    private id!: string;
    private isBusy: boolean = false;
    private givenLeaseTime!: number;
    private config: ConnectionConfig;

    //Creates a new Client everytime we connect
    constructor(config: ConnectionConfig, options?: Options) {
        super();
        this.config = config;
        if (options && options.leaseTime) {
            this.givenLeaseTime = options.leaseTime;
        } else {
            this.givenLeaseTime = 1;
        }
    }

    async connect() {
        try {
            // needed to use await but could not
            this.client = await mysql.createConnection(this.config);
            await this.client.connect();
            this.leaseTime = Date.now() + 1000 * 60 * this.givenLeaseTime;
            this.id = idGenerator();
        } catch (e) {
            throw e;
        }
    }

    async execute<T>(str: string): Promise<T> {
        try {
            const result = (await this.client.query(str)) as T;
            return result;
        } catch (e) {
            throw e;
        }
    }

    async close() {
        try {
            await this.client.end();
        } catch (e) {
            throw e;
        }
    }

    async isExpired() {
        try {
            await this.client.ping();
        } catch (error) {
            console.error(error);
            return true;
        }
        return false;
    }

    getIsBusy() {
        return this.isBusy;
    }

    getLeaseTime() {
        return this.leaseTime;
    }

    renewLeaseTime() {
        this.leaseTime = Date.now() + 1000 * 60 * this.givenLeaseTime;
    }
}
