// Import Stripe to verify the webhook signature
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

// Import a Supabase client that uses elevated permissions (explained below)
import { createClient } from "@supabase/supabase-js";

// This function runs every time Stripe sends an event to this URL
export async function POST(req) {
  // Get the raw request body as text (Stripe needs the exact raw bytes to verify the signature)
  const body = await req.text();

  // Get the signature Stripe attached to this request
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    // Verify this request genuinely came from Stripe, using your webhook secret
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // We only care about one event type: a checkout session completing successfully
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // This is the user ID we attached back in Step 2 (client_reference_id)
    const userId = session.client_reference_id;

    // Create a Supabase client with the SERVICE ROLE key — this bypasses
    // row-level security so the webhook (which has no logged-in user) can update any row
  const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

    // Mark this user as Pro
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_pro: true, stripe_customer_id: session.customer })
      .eq("id", userId);

    if (error) {
      console.log("Error updating profile to Pro:", error.message);
    } else {
      console.log("User upgraded to Pro:", userId);
    }
  }

  return Response.json({ received: true });
}