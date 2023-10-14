import { AbstractConnection } from "../../abstract_connector";
import { idGenerator } from "../../../util/id_generator";
import { timeout } from "../../../util/timeout";

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

class MockClient {
    connectionError = false;
    constructor(config: ConnectionConfig) {
        this.connectionError = false;
    }
}

export class mockConnection extends AbstractConnection {
    private client!: MockClient;
    private leaseTime!: number;
    private id!: string;
    private givenLeaseTime!: number;
    private isBusy: boolean = false;
    private shouldThrowWhileConnect = false;
    private shouldThrowWhileQuery = false;

    constructor(
        config: ConnectionConfig,
        options?: Options,
        shouldThrow?: boolean,
        shoulThrowQuery?: boolean
    ) {
        super();
        this.client = new MockClient(config);
        if (options && options.leaseTime) {
            this.givenLeaseTime = options.leaseTime;
        } else {
            this.givenLeaseTime = 1;
        }
        if (shouldThrow) this.shouldThrowWhileConnect = shouldThrow;
        if (shoulThrowQuery) this.shouldThrowWhileQuery = true;
    }

    async connect(): Promise<void> {
        try {
            //mocking connect
            await timeout(1);
            if (this.shouldThrowWhileConnect) {
                throw new Error("Failed to Connect");
            }
            console.log("Given Lease Time", this.givenLeaseTime);
            this.leaseTime = Date.now() + 1000 * 60 * this.givenLeaseTime;
            this.id = idGenerator();
        } catch (error) {
            throw error;
        }
    }

    async execute<T>(statement: string): Promise<T[]> {
        try {
            this.isBusy = true;
            await timeout(1);
            if (this.shouldThrowWhileQuery) {
                this.isBusy = false;
                throw new Error("Failed to Query");
            }
            this.isBusy = false;
            return [
                { id: 1, name: "Ayon" },
                { id: 2, name: "Bouri" },
            ] as T[];
        } catch (error) {
            throw error;
        }
    }

    setQueryThrowAble() {
        this.shouldThrowWhileQuery = true;
    }

    async close() {
        try {
            await timeout(1);
            this.client.connectionError = true;
        } catch (error) {
            throw error;
        }
    }

    async isExpired() {
        if (this.client.connectionError) {
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
