import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {http} from "@/lib/httpClient"
import { ApiResp } from "./types";

export function useStripeKey() {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await http.get("/get-settings/");
        const resp: ApiResp = res.data;
        if (!resp.error && resp.data?.stripe_publishable_key) {
          const stripeInstance = await loadStripe(resp.data.stripe_publishable_key);
          setStripe(stripeInstance);
        } else {
          setError("Stripe key not found");
        }
      } catch (err) {
        setError("Failed to load Stripe settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);


  return { stripe, loading, error };
}
