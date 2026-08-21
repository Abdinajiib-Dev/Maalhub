import express from 'express';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const emailSubject = `Contact Form Submission: ${subject}`;
    const emailText = `
You have a new contact form submission from MaalHub.

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `;

    const emailHtml = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    // Send email to the support/admin address (you can also use SMTP_FROM_EMAIL to send to yourself)
    await sendEmail({
      to: process.env.SMTP_FROM_EMAIL, // Sending to yourself so you receive the contact message
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      replyTo: email, // So you can easily reply to the user
    });

    res.status(200).json({ message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

export default router;
