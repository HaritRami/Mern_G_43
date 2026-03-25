import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generates a PDF Invoice
 * @param {Object} orderData Contains checkout data like items, totals, payment details
 * @param {Object} user User details
 * @param {Object} address Delivery address
 * @param {String} invoiceId Unique invoice/order ID
 * @returns {Promise<Object>} Resolves with { buffer, filePath }
 */
export const generateInvoicePDF = (orderData, user, address, invoiceId) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure invoices directory exists
      const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice_${invoiceId}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve({ buffer: pdfData, filePath, fileName });
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- Header ---
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('NexaMart', 50, 57)
        .fontSize(10)
        .text('NexaMart Inc.', 200, 50, { align: 'right' })
        .text('123 Retail Street', 200, 65, { align: 'right' })
        .text('Tech City, TC 12345', 200, 80, { align: 'right' })
        .moveDown();

      // --- Title & Order Info ---
      doc.fillColor('#333333').fontSize(20).text('INVOICE', 50, 130);
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 160).lineTo(550, 160).stroke();

      doc
        .fontSize(10)
        .fillColor('#444444')
        .text(`Invoice Number: ${invoiceId}`, 50, 175)
        .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 190)
        .text(`Payment Status: ${orderData.paymentStatus || 'PAID'}`, 50, 205);

      // --- Customer Info ---
      doc
        .text('Billed To:', 300, 175)
        .font('Helvetica-Bold')
        .text(user.name || orderData.email, 300, 190)
        .font('Helvetica')
        .text(`${address.address_line}`, 300, 205)
        .text(`${address.city}, ${address.state}, ${address.country}`, 300, 220)
        .text(`Tel: ${address.mobile}`, 300, 235);

      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 260).lineTo(550, 260).stroke();

      // --- Table Headers ---
      const tableTop = 290;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Quantity', 280, tableTop, { width: 90, align: 'right' });
      doc.text('Unit Price', 370, tableTop, { width: 90, align: 'right' });
      doc.text('Line Total', 460, tableTop, { width: 90, align: 'right' });

      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.font('Helvetica');

      // --- Table Rows ---
      let y = tableTop + 25;
      orderData.items.forEach(item => {
        const lineTotal = item.productId.price * item.quantity;
        
        doc.text(item.productId.name, 50, y, { width: 230 });
        doc.text(item.quantity.toString(), 280, y, { width: 90, align: 'right' });
        doc.text(`$${item.productId.price.toFixed(2)}`, 370, y, { width: 90, align: 'right' });
        doc.text(`$${lineTotal.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
        
        y += 20;
      });

      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
      y += 15;

      // --- Totals ---
      doc.font('Helvetica-Bold');
      y += 5;
      doc.text('Subtotal:', 370, y, { width: 90, align: 'right' });
      doc.text(`$${orderData.subTotalAmt.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
      y += 15;

      if (orderData.discount > 0) {
        doc.text(`Discount${orderData.couponCode ? ' ('+orderData.couponCode+')' : ''}:`, 370, y, { width: 90, align: 'right' });
        doc.text(`-$${orderData.discount.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
        y += 15;
      }

      doc.text('Shipping:', 370, y, { width: 90, align: 'right' });
      doc.text('Free', 460, y, { width: 90, align: 'right' });
      y += 20;

      // Grand Total
      doc.fontSize(14);
      doc.text('Grand Total:', 370, y, { width: 90, align: 'right' });
      doc.text(`$${orderData.totalAmt.toFixed(2)}`, 460, y, { width: 90, align: 'right' });

      // --- Footer ---
      doc.fontSize(10).font('Helvetica').fillColor('#888888');
      doc.text(
        'Thank you for shopping with NexaMart! If you have any questions, please contact support@nexamart.com',
        50,
        700,
        { align: 'center', width: 500 }
      );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};
