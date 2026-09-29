import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(orderData: any, userEmail: string, userName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Skipping order confirmation email.");
    return;
  }

  const orderDate = new Date(orderData.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const orderId = orderData.id ? orderData.id.slice(-6).toUpperCase() : "123456";

  const subtotal = orderData.totalAmount;
  const shipping = 0; // Assuming free shipping for now or get from orderData
  const total = subtotal + shipping;

  const itemsHtml = orderData.items.map((item: any) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #EAEAEA;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="80" valign="top">
              ${item.product?.images?.[0]?.url 
                ? `<img src="${item.product.images[0].url}" width="70" height="70" style="border-radius: 8px; object-fit: cover;" alt="${item.product?.name || 'Product'}" />` 
                : `<div style="width: 70px; height: 70px; background-color: #f3f4f6; border-radius: 8px;"></div>`
              }
            </td>
            <td valign="top" style="padding-left: 16px;">
              <h4 style="margin: 0 0 4px 0; font-family: sans-serif; font-size: 16px; color: #4A3A35;">${item.product?.name || 'Aura Craft Product'}</h4>
              <p style="margin: 0; font-family: sans-serif; font-size: 14px; color: #6b7280;">Qty: ${item.quantity}</p>
            </td>
            <td valign="top" align="right" style="padding-left: 16px;">
              <p style="margin: 0; font-family: sans-serif; font-size: 16px; font-weight: bold; color: #4A3A35;">₹${item.price?.toFixed(2) || '0.00'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FDFBF7; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #4A3A35; padding: 40px 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 2px;">AURA CRAFT</h1>
                  <h2 style="color: #E8DCC4; font-size: 16px; margin: 10px 0 0 0; font-weight: normal; letter-spacing: 1px;">ORDER CONFIRMED</h2>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 40px 20px;">
                  <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #4A3A35;">Thank you for your order, ${userName.split(' ')[0]}!</h3>
                  <p style="margin: 0; font-size: 16px; line-height: 24px; color: #555555;">
                    We've received your order and we're currently processing it. We'll send you another email as soon as it ships.
                  </p>
                </td>
              </tr>

              <!-- Order Details Box -->
              <tr>
                <td style="padding: 0 40px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FDFBF7; border: 1px solid #EAEAEA; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td width="50%">
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #4A3A35;">#${orderId}</p>
                      </td>
                      <td width="50%">
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Order Date</p>
                        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #4A3A35;">${orderDate}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #4A3A35; border-bottom: 2px solid #EAEAEA; padding-bottom: 10px;">Order Summary</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Cost Summary -->
              <tr>
                <td style="padding: 20px 40px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%"></td>
                      <td width="50%">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding: 8px 0; color: #555555;">Subtotal</td>
                            <td align="right" style="padding: 8px 0; color: #4A3A35;">₹${subtotal?.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #555555; border-bottom: 1px solid #EAEAEA;">Shipping</td>
                            <td align="right" style="padding: 8px 0; color: #4A3A35; border-bottom: 1px solid #EAEAEA;">Free</td>
                          </tr>
                          <tr>
                            <td style="padding: 16px 0 0; font-weight: bold; font-size: 18px; color: #4A3A35;">Total</td>
                            <td align="right" style="padding: 16px 0 0; font-weight: bold; font-size: 20px; color: #4A3A35;">₹${total?.toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 0 40px 40px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders/${orderData.id}" style="display: inline-block; background-color: #4A3A35; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 30px; letter-spacing: 1px;">
                    Track Your Order
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #FDFBF7; padding: 30px 40px; border-top: 1px solid #EAEAEA;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #888888;">If you have any questions, reply to this email or contact us at <a href="mailto:support@auracraft.com" style="color: #4A3A35; text-decoration: underline;">support@auracraft.com</a>.</p>
                  <p style="margin: 0; font-size: 12px; color: #aaaaaa;">© ${new Date().getFullYear()} Aura Craft. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Aura Craft <orders@resend.dev>', // resend.dev is allowed for testing
      to: userEmail,
      subject: `Order Confirmation - Aura Craft #${orderId}`,
      html: html,
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      console.log("Order confirmation email sent successfully:", data);
    }
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
}
