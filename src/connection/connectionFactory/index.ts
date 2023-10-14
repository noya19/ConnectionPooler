import { pgConnection } from "../connectors/postgres";
import { mysqlConnection } from "../connectors/mysql";
import { mockConnection } from "../connectors/mock/index";
import { AbstractConnection } from "../abstract_connector";

interface ConnectionConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export class ConnectionFactory {
    private client!: AbstractConnection;
    private cfg: ConnectionConfig;
    private type: "pg" | "mysql" | "mock" | "mockThrow" | "mockThrowQuery";
    constructor(
        type: "pg" | "mysql" | "mock" | "mockThrow" | "mockThrowQuery",
        cfg: ConnectionConfig
    ) {
        this.type = type;
        this.cfg = cfg;
    }

    async createConnection() {
        switch (this.type) {
            case "pg":
                try {
                    this.client = new pgConnection(this.cfg);
                    await this.client.connect();
                    return this.client;
                } catch (e) {
                    throw e;
                }
            case "mysql":
                try {
                    this.client = new mysqlConnection(this.cfg);
                    await this.client.connect();
                    return this.client;
                } catch (e) {
                    throw e;
                }
            case "mock":
                try {
                    this.client = new mockConnection(this.cfg, { leaseTime: 1 / 3 });
                    await this.client.connect();
                    return this.client;
                } catch (error) {
                    throw error;
                }
            case "mockThrow":
                try {
                    this.client = new mockConnection(this.cfg, { leaseTime: 0.3 }, true, false);
                    await this.client.connect();
                    return this.client;
                } catch (error) {
                    throw error;
                }

            case "mockThrowQuery":
                try {
                    this.client = new mockConnection(this.cfg, { leaseTime: 0.3 }, false, true);
                    await this.client.connect();
                    return this.client;
                } catch (error) {
                    throw error;
                }
        }

        return this.client;
    }
}
