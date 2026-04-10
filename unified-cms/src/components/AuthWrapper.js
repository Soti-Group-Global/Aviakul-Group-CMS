"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export default function AuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // Allow public routes without authentication
    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    // Redirect to login if no token
    if (!token) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  if (loading) return null; // or a loading spinner

  return children;
}
