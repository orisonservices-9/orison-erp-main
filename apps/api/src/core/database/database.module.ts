import { Global, Module } from '@nestjs/common';
import { SchoolStore } from './school-store.service';

@Global()
@Module({
  providers: [SchoolStore],
  exports: [SchoolStore],
})
export class DatabaseModule {}
