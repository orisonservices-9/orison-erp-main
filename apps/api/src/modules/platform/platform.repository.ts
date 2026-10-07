import { Injectable } from '@nestjs/common';

const schools = [{ id: 'school-main', name: 'Orison Main Campus', status: 'Active', plan: 'Campus' }];
const plans = [{ id: 'plan-campus', name: 'Campus', status: 'Active' }];
const subscriptions = [{ id: 'sub-main', school: 'Orison Main Campus', plan: 'Campus', status: 'Active' }];
const billing = [{ id: 'bill-main', school: 'Orison Main Campus', amount: 'Included', status: 'Open' }];
const users = [{ id: 'user-platform', name: 'Platform Administrator', role: 'platform_admin', status: 'Active' }];

@Injectable()
export class PlatformRepository {
  schools() { return schools; }
  plans() { return plans; }
  subscriptions() { return subscriptions; }
  billing() { return billing; }
  users() { return users; }
}
