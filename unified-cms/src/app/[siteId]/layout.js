// src/app/[siteId]/layout.js
import SiteLayout from "@/components/SiteLayout";

export default function SiteRootLayout({ children }) {
  return <SiteLayout>{children}</SiteLayout>;
}
