export const logger = {
  info(message: string, extra?: unknown) {
    console.log(JSON.stringify({ level: 'info', message, extra, time: new Date().toISOString() }));
  },
  error(message: string, extra?: unknown) {
    console.error(JSON.stringify({ level: 'error', message, extra, time: new Date().toISOString() }));
  },
};
