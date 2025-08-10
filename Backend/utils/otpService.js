// utils/otpService.js
const otpStore = {}; // In-memory store
const sendMail = require('./mailer'); // adjust the path if needed


function sendOtp(debateId, userId, userEmail, debateTitle) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `${userId}_${debateId}`;

  otpStore[key] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  return sendMail({
    to: userEmail,
    subject: 'Your OTP for Debate Chat Access',
    text: `
Hello,

You registered for the debate: "${debateTitle}"

✅ OTP to join the chat: ${otp}
This OTP is valid for 5 minutes.

Thank you!
    `
  });
}

function verifyOtp(debateId, userId, inputOtp) {
  const key = `${userId}_${debateId}`;
  const entry = otpStore[key];

  if (!entry) {
    return { success: false, message: 'No OTP found. Please request again.' };
  }

  if (Date.now() > entry.expires) {
    delete otpStore[key];
    return { success: false, message: 'OTP expired.' };
  }

  if (entry.otp !== inputOtp) {
    return { success: false, message: 'Invalid OTP.' };
  }

  delete otpStore[key];
  return { success: true, message: 'OTP verified successfully.' };
}

module.exports = {
  sendOtp,
  verifyOtp
};
