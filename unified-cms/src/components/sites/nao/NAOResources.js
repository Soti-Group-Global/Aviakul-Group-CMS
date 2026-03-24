import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { MOCK } from "../../../lib/mockData";
import { Badge } from "../../common/Badge";

export const NAOResources = ({ accent }) => (
  <>
    <SectionHeader
      title="Resources"
      count={MOCK.nao.resources.length}
      accent={accent}
      onAdd={() => {}}
    />
    <DataTable
      accent={accent}
      columns={[
        { key: "title", label: "Resource" },
        {
          key: "type",
          label: "Type",
          render: (v) => {
            const cmap = { PDF: "#f87171", Quiz: "#60a5fa", Video: "#c084fc" };
            return (
              <span
                style={{
                  color: cmap[v] || "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {v}
              </span>
            );
          },
        },
        {
          key: "downloads",
          label: "Downloads",
          render: (v) => (
            <span style={{ fontFamily: "'Space Mono', monospace" }}>
              {v.toLocaleString()}
            </span>
          ),
        },
        { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
      ]}
      rows={MOCK.nao.resources}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </>
);
