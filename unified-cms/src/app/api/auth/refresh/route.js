import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return Response.json(
        { message: "Refresh token required" },
        { status: 400 },
      );
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return Response.json(
        { message: "Invalid or expired refresh token" },
        { status: 403 },
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return Response.json(
        { message: "Invalid refresh token" },
        { status: 403 },
      );
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update stored refresh token (optional, enables rotation)
    user.refreshToken = newRefreshToken;
    await user.save();

    return Response.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
