import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Din Gmail-adress
    pass: process.env.EMAIL_PASS  // App-lösenord från Google
  }
});

export async function sendResetEmail(email: string, resetUrl: string) {
  try {
    const info = await transporter.sendMail({
      from: `"HMP Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click on the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    console.log('✅ E-post Sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}