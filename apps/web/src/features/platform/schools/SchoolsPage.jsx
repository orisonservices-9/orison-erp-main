import React from 'react';
import { PlatformPage } from '../PlatformPage';

const SchoolsPage = () => (
  <PlatformPage
    title="Schools"
    subtitle="Campuses on the Orison platform. School staff do not manage this list."
    path="/platform/schools"
    columns={[{ key: 'name', label: 'School' }, { key: 'status', label: 'Status' }, { key: 'plan', label: 'Plan' }]}
  />
);

export default SchoolsPage;
