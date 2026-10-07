import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class PaymentsService { readonly provider = 'manual'; }

@Module({ providers: [PaymentsService], exports: [PaymentsService] })
export class PaymentsModule {}
