import puppeteer from 'puppeteer';

// ─────────────────────────────────────────────────────────────────────────────
// Invoice HTML Template
// ─────────────────────────────────────────────────────────────────────────────
const buildInvoiceHTML = (orderData, user, address, invoiceId) => {
  const fmt = (n) => {
    const num = parseFloat(n);
    return isNaN(num) ? '0' : num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const items = Array.isArray(orderData.items) ? orderData.items : [];

  const itemsRows = items.map((item, idx) => {
    const name = item?.productId?.name || item?.name || 'Product';
    const unitPrice = parseFloat(item?.productId?.price || item?.price || 0);
    const qty = parseInt(item?.quantity || 1);
    const lineTotal = unitPrice * qty;
    return `
      <tr class="${idx % 2 === 0 ? 'even' : ''}">
        <td>${idx + 1}</td>
        <td>${name}</td>
        <td style="text-align:center">${qty}</td>
        <td style="text-align:right">₹{fmt(unitPrice)}</td>
        <td style="text-align:right">₹{fmt(lineTotal)}</td>
      </tr>`;
  }).join('');

  const paymentLabel = orderData.paymentStatus === 'COD'
    ? 'Cash on Delivery'
    : orderData.paymentStatus || 'Online Payment';

  const paymentBadgeClass = (orderData.paymentStatus === 'COD' || orderData.paymentStatus === 'Paid' || orderData.paymentStatus === 'Completed')
    ? 'badge-success' : 'badge-warning';

  const cityLine = [address?.city, address?.state, address?.country].filter(Boolean).join(', ');

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const discountRow = parseFloat(orderData.discount) > 0 ? `
    <tr class="discount-row">
      <td colspan="2" style="text-align:right">
        Discount${orderData.couponCode ? ` (${orderData.couponCode})` : ''}:
      </td>
      <td style="text-align:right;color:#16a34a">- ₹{fmt(orderData.discount)}</td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice - ${invoiceId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    color: #1e293b;
    background: #ffffff;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 794px;
    min-height: 1123px;
    padding: 48px 52px;
    background: #fff;
    position: relative;
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 3px solid #667eea;
  }

  .logo-wrap .brand-name {
    font-size: 32px;
    font-weight: 800;
    color: #667eea;
    letter-spacing: -1px;
    line-height: 1;
  }

  .logo-wrap .tagline {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
    font-weight: 500;
  }

  .header-right {
    text-align: right;
    font-size: 11px;
    color: #64748b;
    line-height: 1.7;
  }

  .invoice-title {
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
    margin-bottom: 20px;
  }

  /* ── META GRID ── */
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 28px;
  }

  .meta-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px 20px;
  }

  .meta-box .label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #94a3b8;
    margin-bottom: 10px;
  }

  .meta-box .row-item {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    font-size: 11.5px;
    color: #475569;
    border-bottom: 1px solid #f1f5f9;
  }

  .meta-box .row-item:last-child { border-bottom: none; }
  .meta-box .row-item .val { font-weight: 600; color: #1e293b; }

  .billed-name {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
  }

  .billed-address {
    font-size: 11px;
    color: #64748b;
    line-height: 1.6;
  }

  /* ── TABLE ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  thead tr {
    background: #1e293b;
    color: #fff;
  }

  thead th {
    padding: 10px 12px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-align: left;
  }

  thead th:nth-child(3) { text-align: center; }
  thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }

  tbody tr td {
    padding: 9px 12px;
    font-size: 11.5px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tbody tr.even { background: #f8fafc; }

  tbody tr:hover { background: #f0f9ff; }

  /* ── TOTALS ── */
  .totals-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }

  .totals-table {
    width: 280px;
    border-collapse: collapse;
  }

  .totals-table td {
    padding: 6px 10px;
    font-size: 11.5px;
    color: #475569;
  }

  .totals-table td:last-child { text-align: right; font-weight: 500; }

  .discount-row td { color: #16a34a !important; }

  .grand-total-row td {
    background: #667eea;
    color: #ffffff !important;
    font-size: 13px;
    font-weight: 700;
    padding: 10px 12px;
    border-radius: 0;
  }

  .grand-total-row td:first-child { border-radius: 8px 0 0 8px; }
  .grand-total-row td:last-child  { border-radius: 0 8px 8px 0; }

  /* ── BADGES ── */
  .badges-row {
    display: flex;
    gap: 10px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
  .badge-warning { background: #fef9c3; color: #a16207; border: 1px solid #fde68a; }
  .badge-info    { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

  /* ── FOOTER ── */
  .footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
    text-align: center;
    color: #94a3b8;
    font-size: 10px;
    line-height: 1.8;
  }

  .footer strong { color: #667eea; }

  /* ── WATERMARK ── */
  .watermark {
    position: absolute;
    bottom: 80px;
    right: 52px;
    opacity: 0.04;
    font-size: 90px;
    font-weight: 900;
    color: #667eea;
    transform: rotate(-25deg);
    pointer-events: none;
    user-select: none;
  }
</style>
</head>
<body>
<div class="page">

  <!-- Watermark -->
  <div class="watermark">NEXAMART</div>

  <!-- Header -->
  <div class="header">
    <div class="logo-wrap">
      <div class="brand-name">NexaMart</div>
      <div class="tagline">Your Premium Shopping Destination</div>
    </div>
    <div class="header-right">
      <div>support@nexamart.com</div>
      <div>www.nexamart.com</div>
      <div>India</div>
    </div>
  </div>

  <!-- Invoice Title -->
  <div class="invoice-title">TAX INVOICE</div>

  <!-- Meta Grid -->
  <div class="meta-grid">
    <!-- Invoice Details -->
    <div class="meta-box">
      <div class="label">Invoice Details</div>
      <div class="row-item">
        <span>Invoice No.</span>
        <span class="val">${invoiceId}</span>
      </div>
      <div class="row-item">
        <span>Invoice Date</span>
        <span class="val">${dateStr}</span>
      </div>
      <div class="row-item">
        <span>Payment Method</span>
        <span class="val">${paymentLabel}</span>
      </div>
      <div class="row-item">
        <span>Items</span>
        <span class="val">${items.length}</span>
      </div>
    </div>

    <!-- Billed To -->
    <div class="meta-box">
      <div class="label">Billed To</div>
      <div class="billed-name">${user.name || orderData.email || 'Valued Customer'}</div>
      <div class="billed-address">
        ${address?.address_line ? `<div>${address.address_line}</div>` : ''}
        ${cityLine ? `<div>${cityLine}</div>` : ''}
        ${address?.mobile ? `<div>📞 ${address.mobile}</div>` : ''}
        ${orderData.email ? `<div>✉ ${orderData.email}</div>` : ''}
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th style="width:32px">#</th>
        <th>Item Description</th>
        <th style="width:60px">Qty</th>
        <th style="width:110px">Unit Price</th>
        <th style="width:110px">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">No items found</td></tr>'}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals-section">
    <table class="totals-table">
      <tbody>
        <tr>
          <td>Subtotal</td>
          <td>₹{fmt(orderData.subTotalAmt)}</td>
        </tr>
        ${discountRow}
        <tr>
          <td>Shipping</td>
          <td style="color:#16a34a">FREE</td>
        </tr>
        <tr class="grand-total-row">
          <td>Grand Total</td>
          <td>₹{fmt(orderData.totalAmt)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Status Badges -->
  <div class="badges-row">
    <span class="badge ${paymentBadgeClass}">
      ● Payment: ${(orderData.paymentStatus || 'PAID').toUpperCase()}
    </span>
    <span class="badge badge-info">
      ● Invoice generated automatically
    </span>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>Thank you for shopping with <strong>NexaMart</strong>! 🛍️</div>
    <div>For any questions or support, please contact <strong>support@nexamart.com</strong></div>
    <div>© ${new Date().getFullYear()} NexaMart. All rights reserved. | This is a computer-generated invoice — no signature required.</div>
  </div>

</div>
</body>
</html>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Generator — HTML → Puppeteer → PDF (buffer only, no disk write)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Generates a professional PDF invoice using Puppeteer (HTML → PDF).
 *
 * WHY PUPPETEER instead of pdfkit:
 * - pdfkit uses embedded font encoding (hex) that some browser PDF viewers
 *   cannot render, displaying a blank page even though the PDF has valid content.
 * - Puppeteer renders the HTML exactly as a browser would — fully styled,
 *   guaranteed visible in ALL PDF viewers (Adobe, Chrome, Edge, iOS, Android).
 *
 * @param {Object} orderData  Cart totals + items + payment details
 * @param {Object} user       { name }
 * @param {Object} address    Delivery address object
 * @param {String} invoiceId  Master order id (e.g. "ORD-1714000000000")
 * @returns {Promise<{ buffer: Buffer }>}  In-memory buffer only — no disk write.
 */
export const generateInvoicePDF = async (orderData, user, address, invoiceId) => {
  console.log(`[Invoice] 🚀 Generating PDF buffer for ${invoiceId}...`);
  console.log(`[Invoice] Order data:`, JSON.stringify({
    items: (orderData.items || []).length,
    subTotalAmt: orderData.subTotalAmt,
    totalAmt: orderData.totalAmt,
    paymentStatus: orderData.paymentStatus
  }));

  // Build the HTML invoice
  const html = buildInvoiceHTML(orderData, user, address, invoiceId);
  console.log(`[Invoice] HTML Length: ${html.length}`);

  let browser = null;
  try {
    // Launch headless Chrome
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-software-rasterizer'
      ]
    });

    const page = await browser.newPage();

    // Set the HTML content directly (no URL load needed)
    await page.setContent(html, {
      waitUntil: 'domcontentloaded'
    });

    // Wait a moment for any CSS to apply
    await new Promise(r => setTimeout(r, 200));

    // Generate the PDF — no `path` option means buffer-only (no disk write)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,   // required for colored backgrounds/badges
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      }
    });

    console.log(`[Invoice] ✅ PDF buffer ready | size: ${pdfBuffer.length} bytes`);

    return { buffer: Buffer.from(pdfBuffer) };

  } catch (err) {
    console.error('[Invoice] ❌ Puppeteer error:', err.message);
    throw new Error(`Invoice generation failed: ${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('[Invoice] Browser closed.');
    }
  }
};
