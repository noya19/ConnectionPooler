import { Client } from "pg";
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

export class pgConnection extends AbstractConnection {
    private client!: Client & {
        _connectionError?: boolean;
        _ended?: boolean;
        _ending?: boolean;
    };
    private leaseTime!: number;
    private id!: string;
    private givenLeaseTime!: number;
    private isBusy: boolean = false;

    constructor(config: ConnectionConfig, options?: Options) {
        super();
        this.client = new Client(config);
        if (options && options.leaseTime) {
            this.givenLeaseTime = options.leaseTime;
        } else {
            this.givenLeaseTime = 1;
        }
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            this.leaseTime = Date.now() + 1000 * 60 * this.givenLeaseTime;
            this.id = idGenerator();
        } catch (error) {
            throw error;
        }
    }

    async execute<T>(statement: string): Promise<T[]> {
        try {
            this.isBusy = true;
            const result = await this.client.query(statement);
            this.isBusy = false;
            return result.rows as T[];
        } catch (error) {
            throw error;
        }
    }

    async close() {
        try {
            this.client.end((err) => {
                console.log(err);
            });
        } catch (error) {
            throw error;
        }
    }

    async isExpired() {
        if (
            this.client._connectionError ||
            this.client._ended ||
            this.client._ending
        ) {
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
