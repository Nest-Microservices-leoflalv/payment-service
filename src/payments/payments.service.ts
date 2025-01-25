import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  readonly #stripe = new Stripe(envs.STRIPE_API_KEY);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

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
      payment_intent_data: {
        metadata: {
          order_id: orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.SUCCESS_URL,
      cancel_url: envs.CANCEL_URL,
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = this.#stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        envs.ENDPOINT_SECRET,
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSuccess = event.data.object;
        console.log('orderId: ', chargeSuccess.metadata.orderId);
        break;
      default:
        break;
    }

    res.status(200).json(sig);
  }
}
