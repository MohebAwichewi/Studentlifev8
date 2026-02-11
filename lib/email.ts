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

export const sendVerificationSuccess = async (to: string, name: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Student Life <support@student-life.uk>',
      to: [to],
      subject: 'Your Student ID is Verified! 🎉',
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center; color: #333;">
          <h2 style="color: #000;">Student.LIFE</h2>
          <h3>Congrats, ${name}!</h3>
          <p>Your student ID has been verified successfully.</p>
          <p>You now have full access to exclusive student deals and discounts.</p>
          <div style="margin: 30px 0;">
            <a href="https://student-life.uk" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Browse Deals</a>
          </div>
        </div>
      `,
    });
    return !error;
  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};

export const sendVerificationRejection = async (to: string, name: string, reason: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Student Life <support@student-life.uk>',
      to: [to],
      subject: 'Action Required: ID Verification Failed ⚠️',
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center; color: #333;">
          <h2 style="color: #000;">Student.LIFE</h2>
          <h3>Hi ${name},</h3>
          <p>Unfortunately, your student ID verification was rejected.</p>
          
          <div style="background: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
            <strong>Reason:</strong> ${reason}
          </div>

          <p>Please clear up any issues and upload your ID again to unlock student deals.</p>
          
          <div style="margin: 30px 0;">
            <a href="https://student-life.uk" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Try Again</a>
          </div>
        </div>
      `,
    });
    return !error;
  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};
