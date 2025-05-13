import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import Customer from "@/lib/models/Customer";
import Order from "@/lib/models/Order";
import { connectToDB } from "@/lib/mongoDB";
import { stripe } from "@/lib/stripe";
import Role from "@/lib/models/Role";
import { getRoleFromEmail } from "@/lib/roleConfig";

// Handle Clerk webhooks
async function handleClerkWebhook(body: string, headers: Headers) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  const svix_id = headers.get("svix-id");
  const svix_timestamp = headers.get("svix-timestamp");
  const svix_signature = headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error occurred -- no svix headers", { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occurred", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return new NextResponse("No email found", { status: 400 });
    }

    try {
      await connectToDB();

      let userRole = await Role.findOne({ clerkId: id });

      if (!userRole) {
        const assignedRole = getRoleFromEmail(primaryEmail);
        const emailDomain = primaryEmail.split("@")[1];

        userRole = await Role.create({
          clerkId: id,
          email: primaryEmail,
          role: assignedRole,
          emailDomain,
        });

        await userRole.save();
        console.log(`Role created for user ${id}: ${assignedRole}`);
      } else if (userRole.email === "temp@temp.com") {
        // Update the temporary user with real email and role
        userRole.email = primaryEmail;
        userRole.role = getRoleFromEmail(primaryEmail);
        userRole.emailDomain = primaryEmail.split("@")[1];
        await userRole.save();
        console.log(`Updated role for user ${id}: ${userRole.role}`);
      }
    } catch (error) {
      console.error("Error creating role:", error);
      return new NextResponse("Error creating role", { status: 500 });
    }
  }

  return new NextResponse("Webhook processed", { status: 200 });
}

// Handle Stripe webhooks
async function handleStripeWebhook(body: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const customerInfo = {
        clerkId: session?.client_reference_id,
        name: session?.customer_details?.name,
        email: session?.customer_details?.email,
      };

      const shippingAddress = {
        street: session?.shipping_details?.address?.line1,
        city: session?.shipping_details?.address?.city,
        state: session?.shipping_details?.address?.state,
        postalCode: session?.shipping_details?.address?.postal_code,
        country: session?.shipping_details?.address?.country,
      };

      const retrieveSession = await stripe.checkout.sessions.retrieve(
          session.id,
          { expand: ["line_items.data.price.product"]}
      );

      const lineItems = await retrieveSession?.line_items?.data;

      const orderItems = lineItems?.map((item: any) => {
        return {
          product: item.price.product.metadata.productId,
          color: item.price.product.metadata.color || "N/A",
          size: item.price.product.metadata.size || "N/A",
          quantity: item.quantity,
        };
      });

      await connectToDB();

      const newOrder = new Order({
        customerClerkId: customerInfo.clerkId,
        products: orderItems,
        shippingAddress,
        shippingRate: session?.shipping_cost?.shipping_rate,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
      });

      await newOrder.save();

      let customer = await Customer.findOne({ clerkId: customerInfo.clerkId });

      if (customer) {
        customer.orders.push(newOrder._id);
      } else {
        customer = new Customer({
          ...customerInfo,
          orders: [newOrder._id],
        });
      }

      await customer.save();
    }

    return new NextResponse("Order created", { status: 200 });
  } catch (err) {
    console.log("[stripe_webhooks_POST]", err);
    return new NextResponse("Failed to create the order", { status: 500 });
  }
}

// Main POST handler that routes to appropriate webhook handler
export async function POST(req: NextRequest) {
  const body = await req.text();
  const reqHeaders = req.headers;

  // Check if it's a Clerk webhook by looking for svix headers
  const svixId = reqHeaders.get("svix-id");

  if (svixId) {
    return handleClerkWebhook(body, reqHeaders);
  } else {
    const stripeSignature = reqHeaders.get("Stripe-Signature");
    if (stripeSignature) {
      return handleStripeWebhook(body, stripeSignature);
    }
    return new NextResponse("Invalid webhook", { status: 400 });
  }
}