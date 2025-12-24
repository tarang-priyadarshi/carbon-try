// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: '"EcoTrackify" <no-reply@ecotrackify.com>',
    to,
    subject,
    text
  });

  console.log("📧 Email sent!");
  console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
};
