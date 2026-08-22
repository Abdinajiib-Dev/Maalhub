import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

let transporter = null;
try {
  const nodemailer = await import('nodemailer').then(m => m.default || m).catch(() => null);
  if (nodemailer) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
} catch (e) {
  // Nodemailer fallback
}

export const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  try {
    if (!transporter) {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
      return { messageId: `mock-${Date.now()}` };
    }
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@maalhub.com',
      to,
      subject,
      text,
      html: html || text,
      replyTo,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return { messageId: `mock-fallback-${Date.now()}` };
  }
};
