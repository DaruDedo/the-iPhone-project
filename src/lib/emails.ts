import { formatPrice } from "@/data/products";

// Helper to send email via Resend API
export async function sendTransactionalEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!resendApiKey) {
    console.log(
      `[DEV MODE EMAIL] Resend API key is not configured. Would send email to: ${options.to} | Subject: ${options.subject}`,
    );
    return { success: true, devMode: true };
  }

  try {
    console.log(`Sending live email to ${options.to} via Resend: ${options.subject}`);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API error:", errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending email via Resend:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Sends a premium order confirmation receipt to the customer.
 */
export async function sendOrderConfirmationEmail(
  order: {
    orderNumber: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    pincode: string;
    paymentMethod: string;
    subtotal: number;
    shipping: number;
    total: number;
  },
  items: {
    productName: string;
    modelName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[],
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; vertical-align: top;">
        <div style="font-weight: bold; color: #111; font-size: 14px;">${item.productName}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">${item.modelName} (SKU: ${item.sku})</div>
      </td>
      <td style="padding: 12px 0; text-align: center; border-bottom: 1px solid #eaeaea; color: #444; vertical-align: top;">x${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #eaeaea; font-weight: bold; color: #111; vertical-align: top;">₹${item.lineTotal.toLocaleString("en-IN")}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 30px 15px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #eaeaea;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 32px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase;">The iPhone Project</h1>
          <p style="color: #ff5500; margin: 8px 0 0 0; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">Order Confirmed</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #111; font-size: 20px; font-weight: 700;">Thank you for your order, ${order.customerName}!</h2>
          <p style="color: #444; line-height: 1.6; font-size: 15px;">Your order has been received and is being prepared for shipment. Your order number is <strong style="color: #ff5500;">#${order.orderNumber}</strong>.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${siteUrl}/account" style="background-color: #ff5500; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 14px; font-weight: 700; border-radius: 9999px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 10px rgba(255,85,0,0.2);">Track Your Order</a>
          </div>

          <!-- Items Table -->
          <h3 style="border-bottom: 2px solid #111; padding-bottom: 8px; margin-top: 40px; margin-bottom: 15px; color: #111; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="text-align: left; color: #666; font-size: 12px; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Product</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Financial Summary -->
          <table style="width: 100%; margin-top: 20px; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #555;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right; color: #111;">₹${order.subtotal.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555;">Shipping</td>
              <td style="padding: 8px 0; text-align: right; color: #ff5500; font-weight: bold;">${order.shipping === 0 ? "FREE" : "₹" + order.shipping.toLocaleString("en-IN")}</td>
            </tr>
            <tr style="border-top: 1px solid #111; font-weight: bold; font-size: 16px;">
              <td style="padding: 16px 0 0 0; color: #111;">Total Amount</td>
              <td style="padding: 16px 0 0 0; text-align: right; color: #111; font-size: 18px;">₹${order.total.toLocaleString("en-IN")}</td>
            </tr>
          </table>

          <!-- Shipping Details Box -->
          <h3 style="border-bottom: 2px solid #111; padding-bottom: 8px; margin-top: 40px; margin-bottom: 15px; color: #111; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Details</h3>
          <div style="background-color: #f7f7f7; padding: 20px; border-radius: 12px; border: 1px solid #eaeaea; font-size: 14px; color: #444; line-height: 1.6;">
            <div style="margin-bottom: 4px;"><strong>Address:</strong> ${order.address}</div>
            <div style="margin-bottom: 4px;"><strong>Pincode:</strong> ${order.pincode}</div>
            <div style="margin-bottom: 4px;"><strong>Phone:</strong> ${order.phone}</div>
            <div><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</div>
          </div>
          
          <p style="margin-top: 40px; margin-bottom: 0; font-size: 12px; color: #888; text-align: center;">If you have any questions about your order, please reply directly to this email.</p>
        </div>
      </div>
    </div>
  `;

  return sendTransactionalEmail({
    to: order.email,
    subject: `Order Confirmation #${order.orderNumber} - The iPhone Project`,
    html,
  });
}

/**
 * Sends an order status update email to the customer.
 */
export async function sendOrderStatusUpdateEmail(
  order: {
    orderNumber: string;
    customerName: string;
    email: string;
  },
  status: string,
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let statusMessage = "Your order is currently processing.";
  let statusTitle = "Status Update";

  if (status === "confirmed") {
    statusTitle = "Order Confirmed";
    statusMessage =
      "Good news! We have confirmed your order and are starting to package it for dispatch.";
  } else if (status === "packed") {
    statusTitle = "Order Packed";
    statusMessage =
      "Your items have been carefully packaged and are ready to be picked up by our shipping partners.";
  } else if (status === "shipped") {
    statusTitle = "Order Dispatched / Shipped";
    statusMessage =
      "Woohoo! Your order has left our warehouse and is on its way to you. It will arrive shortly.";
  } else if (status === "delivered") {
    statusTitle = "Order Delivered";
    statusMessage =
      "Delivered! Our courier records indicate that your order has been successfully delivered. We hope you love your new iPhone covers!";
  } else if (status === "cancelled") {
    statusTitle = "Order Cancelled";
    statusMessage =
      "We are writing to let you know that your order has been cancelled. If you believe this is a mistake, please reach out to our team.";
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 30px 15px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #eaeaea;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 32px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase;">The iPhone Project</h1>
          <p style="color: #ff5500; margin: 8px 0 0 0; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">${statusTitle}</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #111; font-size: 20px; font-weight: 700;">Hi ${order.customerName},</h2>
          <p style="color: #444; line-height: 1.6; font-size: 15px;">We're updating you on your order <strong style="color: #111;">#${order.orderNumber}</strong>.</p>
          
          <div style="background-color: #f7f7f7; padding: 25px; border-radius: 12px; border: 1px solid #eaeaea; margin: 25px 0; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; color: #666;">Current Status</div>
            <div style="font-size: 24px; font-weight: 800; color: #ff5500; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.02em;">${status}</div>
            <div style="font-size: 14px; color: #444; margin-top: 12px; line-height: 1.5;">${statusMessage}</div>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${siteUrl}/account" style="background-color: #ff5500; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 14px; font-weight: 700; border-radius: 9999px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 10px rgba(255,85,0,0.2);">View Order Details</a>
          </div>
          
          <p style="margin-top: 40px; margin-bottom: 0; font-size: 12px; color: #888; text-align: center;">If you have any questions about this status change, please reply directly to this email.</p>
        </div>
      </div>
    </div>
  `;

  return sendTransactionalEmail({
    to: order.email,
    subject: `Order Status Update: #${order.orderNumber} is ${status.toUpperCase()} - The iPhone Project`,
    html,
  });
}
