import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const user = await User.findOne({ email });
    if (
      !user ||
      user.passwordResetToken !== otp ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < Date.now()
    ) {
      return Response.json(
        { message: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token and clear OTP fields
    user.refreshToken = refreshToken;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Optionally set refresh token as HTTP-only cookie
    const response = Response.json({
      success: true,
      accessToken,
      refreshToken, 
      user: { id: user._id, email: user.email, role: user.role },
    });

    // If you prefer cookie, uncomment:
    // response.headers.set("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Strict`);

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
