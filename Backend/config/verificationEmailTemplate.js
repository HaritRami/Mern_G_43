const verificationEmailTemplate = () => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to NexaMart</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f6f8;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background:#0d6efd;color:#ffffff;padding:35px;text-align:center;">
<h1 style="margin:0;font-size:30px;">NexaMart</h1>
<p style="margin-top:8px;font-size:15px;">A Smarter Way to Shop Online</p>
</td>
</tr>

<!-- Welcome Section -->
<tr>
<td style="padding:40px 50px;text-align:center;">

<h2 style="margin:0;color:#333;">Welcome to NexaMart 🎉</h2>

<p style="margin-top:18px;color:#555;font-size:15px;line-height:1.7;">
Thank you for joining <strong>NexaMart</strong>. We are delighted to welcome you to a platform designed to provide a smooth, reliable, and modern online shopping experience.
</p>

<p style="color:#555;font-size:15px;line-height:1.7;">
NexaMart is built with a vision to make online shopping simple, convenient, and trustworthy. Our platform brings together quality products, trusted sellers, and a seamless shopping environment to ensure the best possible experience for our users.
</p>

<p style="color:#555;font-size:15px;line-height:1.7;">
We strive to deliver value, reliability, and innovation while continuously improving the way people discover and shop for products online.
</p>

<p style="color:#555;font-size:15px;line-height:1.7;">
You are now part of a growing community that believes in smarter shopping, better choices, and a reliable digital marketplace.
</p>

</td>
</tr>

<!-- Support Section -->
<tr>
<td style="padding:0 50px 30px 50px;text-align:center;color:#555;font-size:14px;line-height:1.7;">

<p>
If you have any questions or need assistance, our support team is always ready to help. We are committed to providing the best service and ensuring a great experience for every user.
</p>

<p>
Thank you for choosing NexaMart. We look forward to serving you and making your online shopping journey enjoyable.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f1f1f1;text-align:center;padding:25px;color:#777;font-size:13px;">

<p style="margin:0;">© ${new Date().getFullYear()} NexaMart. All rights reserved.</p>
<p style="margin-top:8px;">Your trusted online marketplace.</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

export default verificationEmailTemplate;