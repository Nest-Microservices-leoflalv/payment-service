import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  readonly #stripe = new Stripe(envs.STRIPE_API_KEY);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items } = paymentSessionDto;

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.#stripe.checkout.sessions.create({
      payment_intent_data: {},
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3003/api/payments/success',
      cancel_url: 'http://localhost:3003/api/payments/cancel',
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    const endpointSecret = 'whsec_OBs4DhTFFmDwKpc3QigCWUjMEnzX6vU5';

    let event: Stripe.Event;

    console.log('req: ', req);

    try {
      event = this.#stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
      console.log('evnet: ', event);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        console.log(event);
        break;
      default:
        break;
    }

    res.status(200).json(sig);
  }
}
