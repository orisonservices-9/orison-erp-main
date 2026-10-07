import React from 'react';
import { PlatformPage } from '../PlatformPage';

const BillingPage = () => (
  <PlatformPage
    title="Billing"
    subtitle="Platform invoices for school subscriptions."
    path="/platform/billing"
    columns={[{ key: 'school', label: 'School' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }]}
  />
);

export default BillingPage;
