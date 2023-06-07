import * as _ from "lodash";
import { reportError } from "../../errors";
import { delay, doWhile } from "../../util/promise";

export const ACCOUNTS_API =
  process.env.ACCOUNTS_API ?? `https://accounts.pipe.tech/api`;

export interface SubscriptionPlan {
  paddleId: number;
  name: string;
  prices?:
    | {
        currency: string;
        monthly: string;
        total: string;
      }
    | "priceless";
}

export const SubscriptionPlans = {
  "pro-monthly": {
    paddleId: 550380,
    name: "Pro (monthly)",
  } as SubscriptionPlan,
  "pro-annual": { paddleId: 550382, name: "Pro (annual)" } as SubscriptionPlan,
  "pro-perpetual": {
    paddleId: 599788,
    name: "Pro (perpetual)",
    prices: "priceless",
  } as SubscriptionPlan,
  "team-monthly": {
    paddleId: 550789,
    name: "Team (monthly)",
  } as SubscriptionPlan,
  "team-annual": {
    paddleId: 550788,
    name: "Team (annual)",
  } as SubscriptionPlan,
};

export type SKU = keyof typeof SubscriptionPlans;

export const getSKU = (paddleId: number | undefined) =>
  _.findKey(SubscriptionPlans, { paddleId: paddleId }) as SKU | undefined;

export const getCheckoutUrl = (email: string, sku: SKU) =>
  `${ACCOUNTS_API}/redirect-to-checkout?email=${encodeURIComponent(
    email
  )}&sku=${sku}&source=app.pipe.tech&returnUrl=${encodeURIComponent(
    "https://httptoolkit.com/app-purchase-thank-you/"
  )}`;

export const openCheckout = async (email: string, sku: SKU) => {
  window.open(getCheckoutUrl(email, sku), "_blank");
};
