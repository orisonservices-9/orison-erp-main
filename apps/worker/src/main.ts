import { logger } from '../../../packages/logger/src/index';
import { describeQueues } from './queues';
import { processJob } from './processors/register';

describeQueues();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  logger.info('Worker is idle. Set REDIS_URL to connect BullMQ. The API records jobs in the outbox until then.');
} else {
  logger.info('REDIS_URL is set. Connect BullMQ workers to this Redis before processing the outbox.', { redisUrl });
}

void processJob;

setInterval(() => undefined, 60_000);
