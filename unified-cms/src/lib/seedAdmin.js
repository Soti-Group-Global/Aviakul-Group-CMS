// lib/seedAdmin.js
import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || "centreforscientificoutreach@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "admin@123";

    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin seeded");
  } catch (err) {
    console.error("❌ Seed error:", err);
  }
}
