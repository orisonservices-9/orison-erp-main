import React from 'react';
import { PlatformPage } from '../PlatformPage';

const SubscriptionsPage = () => (
  <PlatformPage
    title="Subscriptions"
    subtitle="Which plan each school is on."
    path="/platform/subscriptions"
    columns={[{ key: 'school', label: 'School' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' }]}
  />
);

export default SubscriptionsPage;
