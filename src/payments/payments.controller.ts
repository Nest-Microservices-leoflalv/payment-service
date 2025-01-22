import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession() {
    return this.paymentsService.createPaymentSession();
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment done',
    };
  }

  @Post('cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment cancelled',
    };
  }

  @Post('stripe-webhook')
  async stripeWebhook() {
    return 'stripeWebhook';
  }
}
