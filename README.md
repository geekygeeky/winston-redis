# Winston Redis Logger

A flexible and easy-to-use Winston logger transport that integrates with Redis for centralized logging. This package allows you to log to Redis, the console, or any other transport, with full TypeScript support.

---

## Features

- **Winston Logger Integration**: Uses the popular Winston logger.
- **Redis Transport**: Logs can be pushed to a Redis list for centralized storage and retrieval.
- **Flexible Configuration**: Easily toggle Redis transport and configure logging levels.
- **TypeScript Support**: Fully typed with TypeScript for easy development.

---

## Installation

You can install the package via npm or yarn:

```bash
npm install @geekygeeky/winston-redis

````

Or with Yarn:

```bash
yarn add @geekygeeky/winston-redis
```

---

## Usage

### Basic Usage with Redis Transport

```ts
import { RedisLogger } from '@geekygeeky/winston-redis';

const redisLogger = new RedisLogger({
  redisEnabled: true,                       // Enable Redis transport
  redisOptions: { host: 'localhost', port: 6379 }, // Redis connection settings
  redisKey: 'logs:errors',                  // Redis list to store logs
  level: 'info',                             // Minimum logging level
});

const logger = redisLogger.getLoggerInstance()

logger.info('User logged in', { userId: 12345 });
logger.error('Error occurred', { error: 'Something went wrong' });
```

### Without Redis (Console Only)

```ts
import { RedisLogger } from '@geekygeeky/winston-redis';

const logger = new RedisLogger({
  redisEnabled: false,  // Disable Redis transport (only console will be used)
  level: 'debug',       // Set the logging level
}).getLoggerInstance();

logger.debug('Debugging information', { debugInfo: 'extra details' });
```

### Accessing the Redis Instance

If you need to perform advanced Redis operations or monitor the Redis connection directly, you can access the Redis instance:

```ts

const redis = redisLogger.getRedisTransport()?.getRedisInstance();

if (redis) {
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  // Perform custom Redis operations
  redis.set('key', 'value');
}
```

### Accessing the Internal Winston Logger

If you need to access the underlying Winston logger instance directly, you can do so:

```ts
const winstonLogger = redisLogger.getLoggerInstance();
winstonLogger.info('This is a direct Winston log', { additionalData: 'info' });
```

---

## API

### Logger Options

* `redisEnabled` (default: `false`): Whether to enable Redis transport or not.
* `redisOptions`: The options passed to the Redis client (see [ioredis documentation](https://github.com/luin/ioredis#connect-to-redis)).
* `redisKey` (default: `'logs:errors'`): The Redis list key where logs will be stored.
* `level` (default: `'info'`): The minimum level of logging to log.

### Logger Methods

* `log(level: string, message: string, meta?: object)`: Log a message at a specified level with optional metadata.
* `getLoggerInstance()`: Gives you access Winston logger instance.
    * `debug(message: string, meta?: object)`: Log a debug message.
    * `info(message: string, meta?: object)`: Log an info message.
    * `warn(message: string, meta?: object)`: Log a warning message.
    * `error(message: string, meta?: object)`: Log an error message.

### RedisTransport Methods

* `getRedisInstance()`: Access the underlying Redis instance for advanced operations.
* `getRedisTransport()`: Get the Redis transport instance, if enabled.

---

## Testing

### Run Tests

We use Mocha and Chai for testing. To run tests, simply execute:

```bash
npm test
```
---

## Contributing

We welcome contributions to improve this package! Please follow the steps below:

1. Fork the repository and clone it to your local machine.
2. Create a new branch for your changes (`git checkout -b feature/my-feature`).
3. Make your changes and commit them with descriptive messages.
4. Run tests to ensure everything works correctly (`npm test`).
5. Push your changes to your fork and create a pull request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

[Olushola O. (GeekyGeeky)](https://github.com/geekygeeky)