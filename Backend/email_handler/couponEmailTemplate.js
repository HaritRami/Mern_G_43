export const couponEmailTemplate = ({ userName, couponCode, discountPercent, minPurchaseAmount, expiryDate }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Congratulations! You unlocked a reward! 🎉</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #f68084 0%, #f65599 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px; text-align: center; }
        .greeting { font-size: 20px; margin-bottom: 20px; color: #2d3748; }
        .coupon-box {
          background: #ffe4e6;
          border: 2px dashed #f43f5e;
          padding: 20px;
          margin: 25px 0;
          border-radius: 12px;
          display: inline-block;
        }
        .coupon-code {
          font-size: 32px;
          font-weight: bold;
          color: #e11d48;
          letter-spacing: 2px;
          margin: 10px 0;
        }
        .details-box {
          text-align: left;
          background: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
          border: 1px solid #e2e8f0;
        }
        .details-box p { margin: 8px 0; color: #4a5568; }
        .cta-button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #f43f5e;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          margin-top: 30px;
        }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 20px; font-size: 13px; color: #a0aec0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You Unlocked a Reward! 🎉</h1>
        </div>
        <div class="content">
          <div class="greeting">
            Hello ${userName || 'Awesome Customer'},
          </div>
          <p>Thank you for shopping with NexaMart! To show our appreciation, we are giving you an exclusive discount for your next purchase.</p>
          
          <div class="coupon-box">
            <div style="font-size: 16px; color: #881337; font-weight: bold;">YOUR EXCLUSIVE CODE</div>
            <div class="coupon-code">${couponCode}</div>
            <div style="font-size: 18px; color: #be123c;">Get <strong>${discountPercent}% OFF</strong></div>
          </div>

          <div class="details-box">
            <h3 style="margin-top: 0; color: #2d3748;">How to use your coupon:</h3>
            <p>✅ Minimum purchase required: <strong>₹{Number(minPurchaseAmount).toLocaleString('en-IN')}</strong></p>
            <p>✅ Valid until: <strong>${new Date(expiryDate).toLocaleDateString()}</strong></p>
            <p>✅ Use only once per customer</p>
            <p>⛔ Non-transferable & Not combinable with other offers</p>
          </div>

          <a href="http://localhost:3000/category" class="cta-button">Shop Now & Save</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NexaMart. All rights reserved.</p>
          <p>If you have any questions, reply to this email or contact support@nexamart.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
