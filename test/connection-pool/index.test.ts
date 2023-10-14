import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { ConnectionPool } from "../../src/connection_pool";
import { poolOptions } from "../../src/connection_pool/types";
import { ConnectionConfig } from "../../src/connection_pool";
import { resultifyAsync } from "../../src/util/result";
import { timeout } from "../../src/util/timeout";
import { ConnectionFactory } from "../../src/connection/connectionFactory";

describe("Connection Pool", () => {
    let connectionPool: ConnectionPool;
    const config: ConnectionConfig = {
        host: "localhost",
        port: 5432,
        database: "testdb",
        user: "testuser",
        password: "testpassword",
    };

    const options: poolOptions = {
        maxPoolSize: 5,
        mode: "lazy",
    };

    beforeEach(() => {
        connectionPool = new ConnectionPool({ maxPoolSize: 5 }, new ConnectionFactory("mock", config));
    });

    afterEach(async () => {
        await connectionPool.end();
    });

    test("should create a connection pool", () => {
        expect(connectionPool).toBeInstanceOf(ConnectionPool);
    });

    test("should create connections when in eager mode", async () => {
        const eagerPool = new ConnectionPool({ maxPoolSize: 5, mode: "eager" }, new ConnectionFactory("mock", config));;
        await eagerPool.getConnection();

        expect(eagerPool.stats().totalConnections).toEqual(options.maxPoolSize);
    });

    test("should throw when creating connections in lazy mode", async () => {
        const pool = new ConnectionPool(options, new ConnectionFactory("mockThrow", config));;
        const resolve = resultifyAsync(pool.getConnection.bind(pool));
        const [result, error] = await resolve();
        expect(error).toBeTruthy();
    });

    test("should throw when creating connections in eager mode", async () => {
        const pool = new ConnectionPool(options, new ConnectionFactory("mockThrow", config));;
        const resolve = resultifyAsync(pool.getConnection.bind(pool));
        const [result, error] = await resolve();
        expect(error).toBeTruthy();
    });

    test("should get a connection from the pool", async () => {
        const connection = await connectionPool.getConnection();
        expect(connection).toBeDefined();
        expect(connectionPool.stats().totalConnections).toEqual(1);
    });

    test("should execute a statement using a connection", async () => {
        const statement = "SELECT * FROM test_table";
        const result = await connectionPool.execute(statement);
        expect(result).toBeDefined();
    });

    test("should throw when executing a statement using pool", async () => {
        const pool = new ConnectionPool({ maxPoolSize: 5 }, new ConnectionFactory("mockThrowQuery", config));
        const statement = "SELECT * FROM test_table";
        const resolve = resultifyAsync(pool.execute.bind(pool));
        const [result, error] = await resolve(statement);
        expect(error).toBeTruthy();
    });

    test("should get a connection from the pool", async () => {
        const connection = await connectionPool.getConnection();
        expect(connection).toBeDefined();
        expect(connectionPool.stats().totalConnections).toEqual(1);
    });

    test("should end the connection pool", async () => {
        await connectionPool.end();
        expect(connectionPool.stats().totalConnections).toEqual(0);
    });

    test("should cleanup empty the pool", async () => {
        await connectionPool.cleanup();
        expect(connectionPool.stats().totalConnections).toEqual(0);
    });

    test("should get multiple connections from the pool on demand in lazy mode", async () => {
        const connectionPool = new ConnectionPool({ maxPoolSize: 5 }, new ConnectionFactory("mock", config));
        const conn1 = await connectionPool.getConnection();
        const conn2 = await connectionPool.getConnection();
        const conn3 = await connectionPool.getConnection();
        const conn4 = await connectionPool.getConnection();
        const conn5 = await connectionPool.getConnection();
        const conn6 = await connectionPool.getConnection();
        const conn7 = await connectionPool.getConnection();
        const conn8 = await connectionPool.getConnection();
    });

    test("connections assignment should be fault tolerant, in case of a failure create and assign a new connection", async () => {
        const connectionPool = new ConnectionPool({ maxPoolSize: 5 }, new ConnectionFactory("mock", config));
        const conn1 = await connectionPool.getConnection();
        const conn2 = await connectionPool.getConnection();
        const conn3 = await connectionPool.getConnection();
        const conn4 = await connectionPool.getConnection();
        const conn5 = await connectionPool.getConnection();
        await conn1.close();
        const conn6 = await connectionPool.getConnection();
        const conn7 = await connectionPool.getConnection();
        const conn8 = await connectionPool.getConnection();
        expect(connectionPool.stats().totalConnections).toEqual(
            options.maxPoolSize
        );
    });

    test(
        "close connections if leaseTime expires",
        async () => {
            const connectionPool = new ConnectionPool({ maxPoolSize: 5 }, new ConnectionFactory("mock", config));
            const conn1 = await connectionPool.getConnection();
            await timeout(25000);
            connectionPool.cleanup();
            expect(conn1.isExpired()).toBeTruthy();
        },
        {
            timeout: 68000,
        }
    );
});
