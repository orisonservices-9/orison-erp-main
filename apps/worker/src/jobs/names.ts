export const JOBS = {
  email: 'email.send',
  sms: 'sms.send',
  push: 'push.send',
  report: 'reports.generate',
  import: 'imports.bulk',
  export: 'exports.bulk',
  payroll: 'payroll.process',
  feeReminder: 'fees.remind',
  pdf: 'documents.pdf',
  document: 'documents.process',
} as const;
