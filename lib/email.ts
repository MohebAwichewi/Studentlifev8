import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (to: string, code: string) => {
  try {
    await transporter.sendMail({
      from: `"Student.LIFE Security" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Verification Code - Student.LIFE",
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #6246ea;">Student.LIFE</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f3f4f6; display: inline-block; padding: 10px 20px; border-radius: 8px; letter-spacing: 5px;">${code}</h1>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};