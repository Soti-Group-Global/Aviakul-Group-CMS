// src/app/[siteId]/page.js
import { notFound } from "next/navigation";
import { SITES } from "@/lib/sites";
import { ModuleRouter } from "@/components/ModuleRouter";

export default async function SiteDashboard({ params }) {
  const { siteId } = await params;
  const site = SITES[siteId];
  if (!site) notFound();

  return (
    <ModuleRouter
      siteId={siteId}
      moduleId="blog"
      accent={site.color}
      site={site}
    />
  );
}
