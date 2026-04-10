// app/layout.js

import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper";

export const metadata = {
  title: "Unified CMS",
  description: "Multi-site content management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-light-text font-sans">
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
