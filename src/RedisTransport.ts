/*
 * RedisTransport.ts: A logger library that integrates Winston with Redis for centralized logging.
 *
 * (C) 2025, Olushola O.
 *
 */

import Transport from "winston-transport";
import Redis, { type RedisOptions } from "ioredis";

export interface RedisTransportOptions
  extends Transport.TransportStreamOptions {
  redisOptions: RedisOptions;
  key: string;
}

export class RedisTransport extends Transport {
  private redis: Redis;
  private key: string;

  constructor(opts: RedisTransportOptions) {
    super(opts);
    this.redis = new Redis(opts.redisOptions);
    this.key = opts.key;

    // Error handling for Redis connection
    this.redis.on("error", (err) => {
      console.error("Redis error:", err);
    });

    this.redis.on("connect", () => {
      console.log("Connected to Redis");
    });

    this.redis.on("ready", () => {
      console.log("Redis connection is ready");
    });

    this.redis.on("end", () => {
      console.log("Redis connection closed");
    });
  }

  getRedisInstance() {
    return this.redis;
  }

  log(info: any, callback: () => void) {
    setImmediate(() => this.emit("logged", info));

    const { level, message, stack, ...meta } = info;

    const stackLines =
      stack && typeof stack === "string"
        ? stack
            .toString()
            .split("\n")
            .map((line: any) => line.trim())
        : stack;

    // Add stack lines to meta if available
    if (stackLines) {
      meta.stack = stackLines;
    }

    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta: Object.keys(meta).length ? JSON.stringify(meta, null, 2) : null,
    };

    this.redis.lpush(this.key, JSON.stringify(entry));
    callback();
  }
}
