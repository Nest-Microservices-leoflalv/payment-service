import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  readonly #stripe = new Stripe(envs.STRIPE_API_KEY);

  async createPaymentSession() {
    const session = await this.#stripe.checkout.sessions.create({
      payment_intent_data: {},
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Product name',
            },
            unit_amount: 1000,
          },
          quantity: 2,
        },
      ],
      mode: 'payment',
      success_url: 'https://localhost:3000/api/payments/success',
      cancel_url: 'https://localhost:3000/api/payments/cancel',
    });

    return session;
  }
}
