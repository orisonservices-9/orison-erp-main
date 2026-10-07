import { logger } from '../../../../packages/logger/src/index';
import { JOBS } from '../jobs/names';

export const QUEUE_NAME = 'orison-school';

export const registeredJobs = Object.values(JOBS);

export const describeQueues = () => {
  logger.info('Worker queues registered', { queue: QUEUE_NAME, jobs: registeredJobs });
};
