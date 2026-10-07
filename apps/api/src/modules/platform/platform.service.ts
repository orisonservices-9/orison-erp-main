import { Inject, Injectable } from '@nestjs/common';
import { PlatformRepository } from './platform.repository';

@Injectable()
export class PlatformService {
  constructor(@Inject(PlatformRepository) private readonly repository: PlatformRepository) {}

  schools() { return this.repository.schools(); }
  plans() { return this.repository.plans(); }
  subscriptions() { return this.repository.subscriptions(); }
  billing() { return this.repository.billing(); }
  users() { return this.repository.users(); }
}
