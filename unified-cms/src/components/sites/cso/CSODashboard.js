import { StatCard } from "../../common/StatCard";
import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";

export const CSODashboard = ({ accent }) => {
  const d = MOCK.cso;
  return (
    <>
      <div
        style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}
      >
        <StatCard
          label="Active Programs"
          value={d.programs.filter((p) => p.status === "active").length}
          accent={accent}
        />
        <StatCard
          label="Beneficiaries"
          value={d.programs
            .reduce((a, p) => a + p.beneficiaries, 0)
            .toLocaleString()}
          accent={accent}
        />
        <StatCard
          label="Total Donors"
          value={d.donations.donors}
          accent={accent}
        />
        <StatCard
          label="This Month"
          value={`₹${(d.donations.thisMonth / 1000).toFixed(0)}K`}
          accent={accent}
          sub={`${d.donations.recurring} recurring`}
        />
      </div>
      <SectionHeader title="Recent Inquiries" accent={accent} />
      <DataTable
        accent={accent}
        columns={[
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
          { key: "date", label: "Date" },
          {
            key: "status",
            label: "Status",
            render: (v) => <Badge status={v} />,
          },
        ]}
        rows={d.inquiries}
        onEdit={() => {}}
      />
    </>
  );
};
