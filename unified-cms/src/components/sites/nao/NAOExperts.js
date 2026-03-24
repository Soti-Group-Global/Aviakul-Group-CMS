import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { MOCK } from "../../../lib/mockData";

export const NAOExperts = ({ accent }) => (
  <>
    <SectionHeader
      title="Expert Panel"
      count={MOCK.nao.experts.length}
      accent={accent}
      onAdd={() => {}}
    />
    <DataTable
      accent={accent}
      columns={[
        { key: "name", label: "Name" },
        { key: "title", label: "Title / Designation" },
        {
          key: "category",
          label: "Category",
          render: (v) => {
            const cmap = {
              Academia: "#60a5fa",
              Industry: "#34d399",
              Bureaucracy: "#c084fc",
            };
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
      ]}
      rows={MOCK.nao.experts}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </>
);
