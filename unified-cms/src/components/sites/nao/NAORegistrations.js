import { SectionHeader } from "../../common/SectionHeader";
import { StatCard } from "../../common/StatCard";
import { MOCK } from "../../../lib/mockData";

export const NAORegistrations = ({ accent }) => {
  const d = MOCK.nao.registrations;
  return (
    <>
      <SectionHeader title="Registration Data" accent={accent} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard
          label="Total Schools"
          value={d.totalSchools.toLocaleString()}
          accent={accent}
        />
        <StatCard
          label="Total Students"
          value={d.totalStudents.toLocaleString()}
          accent={accent}
        />
        <StatCard label="States & UTs" value={d.states} accent={accent} />
        <StatCard
          label="Group 1"
          value={d.group1.toLocaleString()}
          accent={accent}
          sub="Class 8–10"
        />
        <StatCard
          label="Group 2"
          value={d.group2.toLocaleString()}
          accent={accent}
          sub="Class 11–12"
        />
      </div>
    </>
  );
};
