// Import the Stripe library and initialize it with your secret key
import Stripe from "stripe";
// Tell Stripe exactly which API version to use
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

// This function runs when the frontend sends a POST request to this route
export async function POST(req) {
  // Read the user's ID and email out of the request body
  // (the frontend will send these, since this route can't check Supabase itself)
  const { userId, userEmail } = await req.json();

  // If no user info was sent, reject the request
  if (!userId || !userEmail) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  // Ask Stripe to create a checkout session — a temporary secure payment page
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", // recurring subscription, not a one-time payment
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID, // the $9/month price you created earlier
        quantity: 1,
      },
    ],
    // Where Stripe sends the user after they pay successfully
    success_url: `${req.headers.get("origin")}/?success=true`,
    // Where Stripe sends the user if they cancel/back out
    cancel_url: `${req.headers.get("origin")}/?canceled=true`,
    // Attach the user's ID so we know who paid when Stripe notifies us later
    client_reference_id: userId,
    customer_email: userEmail,
  });

  // Send the checkout page URL back to the frontend
  return Response.json({ url: session.url });
}