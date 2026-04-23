// src/components/ModuleRouter.js
"use client";

import { SettingsPanel } from "./common/SettingsPanel";

// import { TBBTDashboard } from "./sites/tbbt/TBBTDashboard";
import { TBBTEvents } from "./sites/tbbt/TBBTEvents";
import { TBBTBlog } from "./sites/tbbt/TBBTBlog";
import { TBBTGallery } from "./sites/tbbt/TBBTGallery";

// CSO
// import { CSODashboard } from "./sites/cso/CSODashboard";
import { CSOBlog } from "./sites/cso/CSOBlog";
import { CSOPrograms } from "./sites/cso/CSOPrograms";
import { CSOTeam } from "./sites/cso/CSOTeam";
import { CSODonations } from "./sites/cso/CSODonations";
import { CSOInquiries } from "./sites/cso/CSOInquiries";

// NAO
import { NAOBlogs } from "./sites/nao/NAOBlogs";
import { NAOExperts } from "./sites/nao/NAOExperts";
import { NAOResources } from "./sites/nao/NAOResources";
import { NAOPartners } from "./sites/nao/NAOPartners";
import { NAORegistrations } from "./sites/nao/NAORegistrations";
import { NAONews } from "./sites/nao/NAONews";
import { SchoolResources } from "./sites/portals/SchoolResources";
import { StudentResources } from "./sites/portals/StudentResources";
import { WebsiteResources } from "./sites/portals/WebsiteResources";

const map = {
  // tbbt: {
  //   blog: TBBTBlog,
  //   events: TBBTEvents,

  //   gallery: TBBTGallery,
  // },
  cso: {
    blogs: CSOBlog,
    programs: CSOPrograms,
    team: CSOTeam,
    donations: CSODonations,
    inquiries: CSOInquiries,
  },
  nao: {
    blogs: NAOBlogs,
    experts: NAOExperts,
    resources: NAOResources,
    partners: NAOPartners,
    registrations: NAORegistrations,
    news: NAONews,
  },
  portals: {
    "school-resources": SchoolResources,
    "student-resources": StudentResources,
    "website-resources": WebsiteResources,
  },
};

export const ModuleRouter = ({ siteId, moduleId, accent, site }) => {
  if (moduleId === "settings")
    return <SettingsPanel site={site} accent={accent} />;
  const Component = map[siteId]?.[moduleId];
  return Component ? (
    <Component accent={accent} id={site.id} />
  ) : (
    <div style={{ color: "rgba(255,255,255,0.4)" }}>Module not found</div>
  );
};
