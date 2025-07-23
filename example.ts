import { RedisLogger } from "./src/Logger";

const redisLogger = new RedisLogger({
  redisEnabled: true,
  redisOptions: { host: "localhost", port: 6379 },
  redisKey: "logs:errors:test3",
});

const logger = redisLogger.getLoggerInstance();

const main = async () => {
  // testError();

  // logger.log("error", "error", { error: new Error("some stuff") });
  const paginatedLogs = await redisLogger.getPaginatedLogs(1, 10);
  console.log(paginatedLogs);
};

const testError = async () => {
  try {
    throw new Error("some stuff");
  } catch (error) {
    logger.error(error);
  }
};

main();
