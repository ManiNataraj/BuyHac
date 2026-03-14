import { Resend } from "resend";

const resendApiKey = (process.env.RESEND_EMAILAPI_KEY || "").trim();
if (!resendApiKey) {
  throw new Error("Missing RESEND_EMAILAPI_KEY environment variable.");
}

const resend = new Resend(resendApiKey);

const fromEmail = (process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev").trim();

export async function sendPriceDropAlert(userEmail, product, oldPrice, newPrice) {
  try {
    const priceDrop = (oldPrice - newPrice).toFixed(2);
    const percentageDrop = ((priceDrop / oldPrice) * 100).toFixed(1);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL , // Use verified domain in production
      to: [userEmail],
      subject: `🚨 Price Drop Alert: ${product.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f97316; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Good news! The price dropped.</h1>
          </div>
          
          <div style="padding: 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="${product.image_url}" alt="${product.name}" style="width: 200px; height: 200px; object-cover: contain; border-radius: 8px;" />
            </div>
            
            <h2 style="color: #111827; margin-bottom: 8px;">${product.name}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
              We noticed a price drop on a product you're tracking. You can now save <strong>${percentageDrop}%</strong> if you buy now!
            </p>
            
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 24px 0; display: flex; justify-content: space-around; text-align: center;">
              <div>
                <p style="margin: 0; color: #9ca3af; text-decoration: line-through;">${product.currency} ${oldPrice}</p>
                <p style="margin: 0; color: #ef4444; font-size: 24px; font-weight: bold;">${product.currency} ${newPrice}</p>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${product.url}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Product on Store
              </a>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Sent by BUYHAC • The smart way to track prices
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email Service Error:", error);
    return { success: false, error: error.message };
  }
}