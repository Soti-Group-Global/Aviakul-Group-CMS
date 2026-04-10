import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTP } from "@/lib/mail";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json(
        { success: false, message: "Invalid password" },
        { status: 401 },
      );
    }

    // Optional: prevent OTP spam (e.g., allow only once per 60 sec)
    const now = Date.now();
    if (user.lastOtpSentAt && now - user.lastOtpSentAt < 60000) {
      return Response.json(
        {
          success: false,
          message: "Please wait before requesting another OTP",
        },
        { status: 429 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetToken = otp;
    user.passwordResetExpires = now + 5 * 60 * 1000;
    user.lastOtpSentAt = now;
    await user.save();

    await sendOTP(email, otp);

    return Response.json({
      success: true,
      message: "OTP sent",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
