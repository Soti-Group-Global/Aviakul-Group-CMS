import { SectionHeader } from "../../common/SectionHeader";
import { StatCard } from "../../common/StatCard";
import { MOCK } from "../../../lib/mockData";

export const CSODonations = ({ accent }) => {
  const d = MOCK.cso.donations;
  return (
    <>
      <SectionHeader title="Donations Overview" accent={accent} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard
          label="Total Raised"
          value={`₹${(d.total / 100000).toFixed(1)}L`}
          accent={accent}
        />
        <StatCard
          label="This Month"
          value={`₹${(d.thisMonth / 1000).toFixed(0)}K`}
          accent={accent}
        />
        <StatCard label="Total Donors" value={d.donors} accent={accent} />
        <StatCard
          label="Recurring"
          value={d.recurring}
          accent={accent}
          sub="monthly supporters"
        />
      </div>
    </>
  );
};
