import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";

export const CSOPrograms = ({ accent }) => (
  <>
    <SectionHeader
      title="Programs & Initiatives"
      count={MOCK.cso.programs.length}
      accent={accent}
      onAdd={() => {}}
    />
    <DataTable
      accent={accent}
      columns={[
        { key: "name", label: "Program" },
        { key: "location", label: "Location" },
        {
          key: "beneficiaries",
          label: "Beneficiaries",
          render: (v) => (
            <span style={{ fontFamily: "'Space Mono', monospace" }}>
              {v.toLocaleString()}
            </span>
          ),
        },
        { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
      ]}
      rows={MOCK.cso.programs}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </>
);
