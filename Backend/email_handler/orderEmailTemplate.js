export const orderConfirmationTemplate = ({ userName, orderId, orderData, address }) => {
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #4a5568;">
        <strong>${item.productId.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #4a5568;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #4a5568;">$${item.productId.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #4a5568;">$${(item.productId.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - NexaMart</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #2d3748; }
        .order-info { background: #ebf8ff; padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 4px solid #4299e1; }
        .order-info p { margin: 5px 0; color: #2b6cb0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #4a5568; font-weight: 600; }
        .totals-table { width: 100%; margin-top: 20px; }
        .totals-row td { padding: 8px 12px; text-align: right; color: #4a5568; }
        .totals-final { font-size: 18px; font-weight: bold; color: #2d3748; border-top: 2px solid #e2e8f0; }
        .address-box { background: #f8fafc; padding: 20px; border-radius: 6px; margin-top: 30px; border: 1px solid #e2e8f0; }
        .address-box h3 { margin-top: 0; margin-bottom: 10px; color: #2d3748; font-size: 16px; }
        .address-box p { margin: 0 0 5px 0; color: #4a5568; font-size: 14px; }
        .cta-container { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #4299e1; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; padding: 20px; font-size: 13px; color: #a0aec0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NexaMart</h1>
        </div>
        <div class="content">
          <div class="greeting">
            Hello ${userName || 'Customer'},
          </div>
          <p>Thank you for your order! We're processing it now and will let you know once it ships.</p>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentStatus === 'COD' ? 'Cash on Delivery' : 'Prepaid (Razorpay)'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="totals-table">
            <tr class="totals-row">
              <td width="70%">Subtotal:</td>
              <td width="30%">$${orderData.subTotalAmt.toFixed(2)}</td>
            </tr>
            ${orderData.discount > 0 ? `
            <tr class="totals-row">
              <td width="70%">Discount:</td>
              <td width="30%">-$${orderData.discount.toFixed(2)}</td>
            </tr>` : ''}
            <tr class="totals-row">
              <td width="70%">Shipping:</td>
              <td width="30%">Free</td>
            </tr>
            <tr class="totals-row totals-final">
              <td width="70%" style="padding-top: 12px;">Grand Total:</td>
              <td width="30%" style="padding-top: 12px;">$${orderData.totalAmt.toFixed(2)}</td>
            </tr>
          </table>

          <div class="address-box">
            <h3>Delivery Address</h3>
            <p>${address.address_line}</p>
            <p>${address.city}, ${address.state}, ${address.country}</p>
            <p>Tel: ${address.mobile}</p>
          </div>

          <div class="cta-container">
            <a href="http://localhost:3000/category" class="cta-button">Continue Shopping</a>
          </div>
        </div>
        <div class="footer">
          <p>We've attached your invoice PDF to this email for your records.</p>
          <p>&copy; ${new Date().getFullYear()} NexaMart. All rights reserved.</p>
          <p>If you have any questions, reply to this email or contact support@nexamart.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
