export class PlatformPolicy {
  readonly area = 'platform' as const;

  allows(role: string) {
    return role === 'platform_admin';
  }
}
