import React from 'react';
import { PlatformPage } from '../PlatformPage';

const PlansPage = () => (
  <PlatformPage
    title="Plans"
    subtitle="Product plans a school can subscribe to."
    path="/platform/plans"
    columns={[{ key: 'name', label: 'Plan' }, { key: 'status', label: 'Status' }]}
  />
);

export default PlansPage;
