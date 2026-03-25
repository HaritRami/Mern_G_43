import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Provide EMAIL_USER and EMAIL_PASS API key inside the .env file");
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
});

const sendemail = async ({ sendTo, Subject, html, attachments }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: sendTo,
            subject: Subject,
            html: html,
        };
        
        if (attachments) {
            mailOptions.attachments = attachments;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return info;
    } catch (error) {
        console.error("Email sending error:", error);
        throw error;
    }
};

export default sendemail;