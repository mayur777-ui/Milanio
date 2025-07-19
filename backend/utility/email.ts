import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendEmailOtp = async (to: string, otp: Number) => {
  try {
    await transporter.sendMail({
      from: process.env.Google_email,
      to: to,
      subject: "Password Reset OTP",
      html: `<div style="
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  background: #f9fafb; 
  padding: 20px; 
  border-radius: 12px; 
  max-width: 400px; 
  margin: auto; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: #333;
">
  <h2 style="color: #4f46e5; margin-bottom: 10px;">Password Reset OTP</h2>
  <p style="font-size: 16px; line-height: 1.5;">
    Your OTP for password reset is 
    <span style="
      display: inline-block;
      background: #4f46e5;
      color: white;
      padding: 10px 18px;
      font-weight: 700;
      font-size: 18px;
      border-radius: 8px;
      letter-spacing: 2px;
      user-select: all;
      ">
      ${otp}
    </span>
  </p>
  <p style="font-size: 14px; color: #6b7280; margin-top: 12px;">
    This OTP is valid for 10 minutes. Please do not share it with anyone.
  </p>
</div>
`,
    }).then(() => {
        console.log("OTP sent to your email");
      }).catch((error) => {
        console.error("Error sending email:", error);
      })
  }catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email");
  }
};
