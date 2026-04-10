import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Check OTP and expiration
    if (
      user.passwordResetToken !== otp ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < Date.now()
    ) {
      return Response.json(
        { message: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshToken = null; // Invalidate all sessions

    await user.save();

    return Response.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
