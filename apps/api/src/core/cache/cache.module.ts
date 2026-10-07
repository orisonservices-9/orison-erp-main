import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly values = new Map<string, unknown>();
  get<T>(key: string) { return this.values.get(key) as T | undefined; }
  set(key: string, value: unknown) { this.values.set(key, value); }
}

@Module({ providers: [CacheService], exports: [CacheService] })
export class CacheModule {}
