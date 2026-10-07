import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class ExternalServicesService { readonly services = ['razorpay']; }

@Module({ providers: [ExternalServicesService], exports: [ExternalServicesService] })
export class ExternalServicesModule {}
