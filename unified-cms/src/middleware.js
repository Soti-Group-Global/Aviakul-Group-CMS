import { NextResponse } from "next/server";

// Add all allowed origins here
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
   "http://localhost:3002",
  "http://localhost:5173",
  "https://your-frontend.com",
];

export function middleware(req) {
  const origin = req.headers.get("origin");

  const isAllowed = allowedOrigins.includes(origin);

  const response = NextResponse.next();

  // Set CORS headers
  response.headers.set(
    "Access-Control-Allow-Origin",
    isAllowed ? origin : ""
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Handle preflight (IMPORTANT)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

// Apply only to API routes
export const config = {
  matcher: "/api/:path*",
};