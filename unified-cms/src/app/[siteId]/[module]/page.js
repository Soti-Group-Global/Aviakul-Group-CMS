
import { notFound } from "next/navigation";
import { SITES } from "@/lib/sites";
import { ModuleRouter } from "@/components/ModuleRouter";

export default async function SiteModulePage({ params }) {
  const { siteId, module } = await params;
  const site = SITES[siteId];
  if (!site) notFound();

  // Check if the module exists in the site's modules
  const moduleExists = site.modules.some((m) => m.id === module);
  if (!moduleExists) notFound();

  return (
    <ModuleRouter
      siteId={siteId}
      moduleId={module}
      accent={site.color}
      site={site}
    />
  );
}
