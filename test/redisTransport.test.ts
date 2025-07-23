import { RedisTransport } from "../src/RedisTransport.ts";
import Redis from "ioredis";
import sinon from "sinon";
import { expect } from "chai";

// Mock Redis
class MockRedis extends Redis {
  lpush = sinon.stub();
}

describe("RedisTransport", () => {
  let redisMock: MockRedis;
  let redisTransport: RedisTransport;

  beforeEach(() => {
    redisMock = new MockRedis({ host: "localhost", port: 6379 });

    redisTransport = new RedisTransport({
      redisOptions: { host: "localhost", port: 6379 },
      key: "logs:errors",
    });

    // Overwrite the internal Redis instance with the mock
    redisTransport["redis"] = redisMock;
  });

  it("should push log entries to Redis", () => {
    const logEntry = {
      level: "info",
      message: "Test log",
      timestamp: new Date().toISOString(),
      meta: {},
    };

    // Stub the lpush method to resolve successfully
    redisMock.lpush.resolves("1");

    const callback = sinon.spy();

    redisTransport.log(logEntry, callback);

    // Check that lpush was called with the correct parameters
    expect(redisMock.lpush.calledOnce).to.be.true;
    expect(redisMock.lpush.args[0][0]).to.equal("logs:errors");
    expect(redisMock.lpush.args[0][1]).to.include("Test log");
    expect(callback.calledOnce).to.be.true;
  });

  it("should include stack trace in metadata if available", () => {
    const error = new Error("Test error");
    const logEntry = {
      level: "error",
      message: "Error occurred",
      timestamp: new Date().toISOString(),
      meta: { error },
    };

    // Stub the lpush method to resolve successfully
    redisMock.lpush.resolves("1");

    const callback = sinon.spy();

    redisTransport.log(logEntry, callback);

    // Check that stack trace is included in the metadata
    const logData = JSON.parse(redisMock.lpush.args[0][1]);
    console.log(typeof logData.meta)
    expect(logData.meta).to.contain('error')
  });
});
