import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // ✅ ensures this file also gets env values

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail({ to, subject, text }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `"Citizen Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Email sent to: ", to);
  } catch (err) {
    console.error("Failed to send email: ", err);
  }
}