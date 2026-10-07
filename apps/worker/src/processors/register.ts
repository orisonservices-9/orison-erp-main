import { logger } from '../../../../packages/logger/src/index';
import { JOBS } from '../jobs/names';

const processors: Record<string, (payload: unknown) => void> = {
  [JOBS.email]: (payload) => logger.info('Email job received', payload),
  [JOBS.sms]: (payload) => logger.info('SMS job received', payload),
  [JOBS.push]: (payload) => logger.info('Push notification job received', payload),
  [JOBS.report]: (payload) => logger.info('Report job received', payload),
  [JOBS.import]: (payload) => logger.info('Bulk import job received', payload),
  [JOBS.export]: (payload) => logger.info('Bulk export job received', payload),
  [JOBS.payroll]: (payload) => logger.info('Payroll job received', payload),
  [JOBS.feeReminder]: (payload) => logger.info('Fee reminder job received', payload),
  [JOBS.pdf]: (payload) => logger.info('PDF job received', payload),
  [JOBS.document]: (payload) => logger.info('Document job received', payload),
};

export const processJob = (name: string, payload: unknown) => {
  const processor = processors[name];
  if (!processor) {
    logger.error('No worker processor for job', { name });
    return;
  }
  processor(payload);
};
