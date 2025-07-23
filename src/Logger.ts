import winston, { Logger as WinstonLogger, transports } from "winston";
import { type RedisOptions } from "ioredis";
import { RedisTransport } from "./RedisTransport";
import assert from "assert";

// Logger configuration options
interface LoggerOptions {
  redisEnabled?: boolean;
  consoleEnabled?: boolean;
  redisOptions?: RedisOptions;
  redisKey?: string;
  level?: string;
}

export class RedisLogger {
  private logger: WinstonLogger;
  private redisEnabled: boolean;
  private redisKey: string;

  constructor(options: LoggerOptions = {}) {
    const {
      redisEnabled = true,
      consoleEnabled = true,
      redisOptions,
      redisKey = "logs:errors",
      level = "debug",
    } = options;
    this.redisEnabled = redisEnabled;
    this.redisKey = redisKey;

    const transportList: winston.transport[] = [];

    if (consoleEnabled) {
      transportList.push(
        new transports.Console({
          level,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }

    // Conditionally add Redis transport if redisEnabled is true
    if (redisEnabled && redisOptions) {
      transportList.push(
        new RedisTransport({
          redisOptions: redisOptions,
          key: redisKey,
          level: "error",
        })
      );
    }

    this.logger = winston.createLogger({
      level,
      transports: transportList,
    });
  }

  // Expose the internal Winston logger instance
  getLoggerInstance(): WinstonLogger {
    return this.logger;
  }

  getRedisTransport(): RedisTransport | undefined {
    const redisTransport = this.logger.transports.find(
      (transport) => transport instanceof RedisTransport
    );
    return redisTransport as RedisTransport | undefined;
  }

  // Log with metadata
  log(level: string, message: string, ...meta: any[]) {
    this.logger.log(level, message, meta);
  }

  // Add a custom transport
  addTransport(transport: winston.transport) {
    this.logger.add(transport);
  }

  /**
   * Fetch paginated logs from Redis
   * @param page The current page number (1-indexed)
   * @param limit Number of logs per page
   */
  async getPaginatedLogs(page = 1, limit = 20) {
    assert(this.redisEnabled, "Redis must be enabled to fetch logs");

    const redis = this.getRedisTransport()?.getRedisInstance();
    if (!redis) throw new Error("Redis instance not found");

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const [totalCount, rawLogs] = await Promise.all([
      redis.llen(this.redisKey),
      redis.lrange(this.redisKey, start, end),
    ]);

    const logs = rawLogs.map((logStr) => {
      try {
        return JSON.parse(logStr);
      } catch {
        return { raw: logStr };
      }
    });

    return {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      logs,
    };
  }
}
