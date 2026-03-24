import { StatCard } from "../../common/StatCard";
import { MOCK } from "../../../lib/mockData";

export const NAODashboard = ({ accent }) => {
  const d = MOCK.nao;
  return (
    <>
      <div
        style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}
      >
        <StatCard
          label="Schools Registered"
          value={d.registrations.totalSchools.toLocaleString()}
          accent={accent}
        />
        <StatCard
          label="Students"
          value={d.registrations.totalStudents.toLocaleString()}
          accent={accent}
        />
        <StatCard
          label="States & UTs"
          value={d.registrations.states}
          accent={accent}
        />
        <StatCard
          label="Expert Committee"
          value={`${d.experts.length}+`}
          accent={accent}
        />
      </div>
      <div
        style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}
      >
        <StatCard
          label="Group 1 (Class 8–10)"
          value={d.registrations.group1.toLocaleString()}
          accent={accent}
        />
        <StatCard
          label="Group 2 (Class 11–12)"
          value={d.registrations.group2.toLocaleString()}
          accent={accent}
        />
        <StatCard
          label="Resources Published"
          value={d.resources.filter((r) => r.status === "published").length}
          accent={accent}
        />
        <StatCard label="Partners" value={d.partners.length} accent={accent} />
      </div>
    </>
  );
};
