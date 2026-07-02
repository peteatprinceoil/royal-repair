import Stripe from "stripe"

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-06-24.dahlia",
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
