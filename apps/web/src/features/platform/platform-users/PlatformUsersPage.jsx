import React from 'react';
import { PlatformPage } from '../PlatformPage';

const PlatformUsersPage = () => (
  <PlatformPage
    title="Platform users"
    subtitle="People who administer Orison, not a single school."
    path="/platform/users"
    columns={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'status', label: 'Status' }]}
  />
);

export default PlatformUsersPage;
