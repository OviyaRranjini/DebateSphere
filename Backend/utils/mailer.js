const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendMail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: `"Debate Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text.trim()
    });
    // console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err;
  }
};

module.exports = sendMail;
