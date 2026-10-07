import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class NotificationDeliveryService { readonly channel = 'in-app'; }

@Module({ providers: [NotificationDeliveryService], exports: [NotificationDeliveryService] })
export class NotificationsModule {}
