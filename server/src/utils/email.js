import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// .env is in the server root (two levels up from src/utils)
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = port === 465;
  const user = process.env.SMTP_USER || process.env.SMTP_FROM_EMAIL;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : undefined;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
};

/**
 * Send an email using the configured SMTP transporter
 * @param {Object} options 
 * @param {string} [options.to] - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} [options.html] - HTML content (optional)
 * @param {string} [options.replyTo] - Reply-To email address (optional)
 * @returns {Promise<any>}
 */
export const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'maalhubsupport@gmail.com';
    const recipient = to || fromEmail;

    const transporter = getTransporter();

    const mailOptions = {
      from: fromEmail,
      to: recipient,
      subject,
      text,
      html: html || text, // Fallback to text if html is not provided
      replyTo,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
