import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class StorageService { readonly driver = 'local'; }

@Module({ providers: [StorageService], exports: [StorageService] })
export class StorageModule {}
