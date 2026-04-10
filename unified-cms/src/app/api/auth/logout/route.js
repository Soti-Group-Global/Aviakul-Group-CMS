import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyRefreshToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { refreshToken } = await req.json();

    if (refreshToken) {
      // Try to verify the refresh token (optional – we can just clear by value)
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded && decoded.userId) {
        // Clear refresh token for that user
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      } else {
        // If token is invalid, still try to find user by the token value
        await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
      }
    }

    return Response.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ success: true, message: "Logged out" }); // always return success
  }
}
