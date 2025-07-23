import { RedisLogger } from '../src/Logger.ts';
import sinon from 'sinon';
import { expect } from 'chai';
import Redis from 'ioredis';
import { assert } from 'chai';

describe('Logger', () => {
  let logger: RedisLogger;
  let redisMock: sinon.SinonStubbedInstance<Redis>;

  beforeEach(() => {
    redisMock = sinon.createStubInstance(Redis);
    logger = new RedisLogger({
      redisEnabled: true,
      redisOptions: { host: 'localhost', port: 6379 },
      redisKey: 'logs:errors',
    });
  });

  it('should call the correct log level method', () => {
    const loggerInstance = logger.getLoggerInstance();
    const debugSpy = sinon.spy(logger.getLoggerInstance(), 'debug');
    const infoSpy = sinon.spy(loggerInstance, 'info');
    const errorSpy = sinon.spy(loggerInstance, 'error');

    loggerInstance.debug('Debugging...');
    loggerInstance.info('Informational message');
    loggerInstance.error('Error occurred');

    expect(debugSpy.calledOnce).to.be.true;
    expect(infoSpy.calledOnce).to.be.true;
    expect(errorSpy.calledOnce).to.be.true;
  });

  it('should call log method with correct level and message', () => {
    const loggerInstance = logger.getLoggerInstance();
    const logSpy = sinon.spy(logger, 'log');

    loggerInstance.debug('Debugging...');
    loggerInstance.info('Informational message');
    loggerInstance.error('Error occurred');

    expect(logSpy.calledWith('debug', 'Debugging...')).to.be.true;
    expect(logSpy.calledWith('info', 'Informational message')).to.be.true;
    expect(logSpy.calledWith('error', 'Error occurred')).to.be.true;
  });

  it('should throw error if Redis is not enabled when calling getPaginatedLogs', async () => {
    logger = new RedisLogger({
      redisEnabled: false,
      redisOptions: { host: 'localhost', port: 6379 },
      redisKey: 'logs:errors',
    });

    try {
      await logger.getPaginatedLogs(1, 10);
      assert.fail('Expected error not thrown');
    } catch (error) {
      expect(error.message).to.equal('Redis must be enabled to fetch logs');
    }
  });

  it('should correctly fetch paginated logs from Redis', async () => {
    redisMock.llen.resolves(2); // Total logs in Redis
    redisMock.lrange.resolves(['{"level": "info", "message": "Test log 1"}', '{"level": "info", "message": "Test log 2"}']); // Mock logs returned

    const paginatedLogs = await logger.getPaginatedLogs(1, 10);
    
    expect(paginatedLogs.page).to.equal(1);
    expect(paginatedLogs.totalCount).to.equal(118);
    expect(paginatedLogs.totalPages).to.equal(12);
    expect(paginatedLogs.logs.length).to.equal(10);
    expect(paginatedLogs.logs[0].message).to.equal('Test log 1');
  });
});
