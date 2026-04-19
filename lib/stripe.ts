/**
 * Stripe client.
 * Run `npm install stripe` to activate.
 *
 * Required env vars (add to Vercel):
 *   STRIPE_SECRET_KEY       — from Stripe dashboard → Developers → API keys
 *   STRIPE_WEBHOOK_SECRET   — from Stripe dashboard → Developers → Webhooks
 *   STRIPE_PRICE_ID         — create a recurring price in Stripe dashboard, paste the price_xxx ID
 */

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}
