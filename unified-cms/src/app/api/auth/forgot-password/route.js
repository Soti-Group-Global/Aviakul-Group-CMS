import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTP } from "@/lib/mail";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    const user = await User.findOne({ email });
    if (!user) {
      // Silently return success to avoid revealing that the email doesn't exist
      return Response.json({
        success: true,
        message: "If an account exists, an OTP has been sent",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetToken = otp;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();
    await sendOTP(email, otp);

    return Response.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
