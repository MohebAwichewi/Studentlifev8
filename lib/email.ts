import { Resend } from 'resend';

const resend = new Resend('re_VMjQDLk9_7DzcovXwZs4vR35cijz2t7kq');

export const sendOTP = async (to: string, code: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'otp@student-life.uk',
      to: [to],
      subject: 'Your Verification Code - Student.LIFE',
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #6246ea;">Student.LIFE</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f3f4f6; display: inline-block; padding: 10px 20px; border-radius: 8px; letter-spacing: 5px;">${code}</h1>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return false;
    }

    console.log("Resend Success:", data);
    return true;
  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};
