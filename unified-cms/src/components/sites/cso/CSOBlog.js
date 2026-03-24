import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";

export const CSOBlog = ({ accent }) => (
  <>
    <SectionHeader
      title="Blog / News"
      count={MOCK.cso.blog.length}
      accent={accent}
      onAdd={() => {}}
    />
    <DataTable
      accent={accent}
      columns={[
        { key: "title", label: "Title" },
        { key: "author", label: "Author" },
        { key: "date", label: "Date" },
        {
          key: "views",
          label: "Views",
          render: (v) => (
            <span style={{ fontFamily: "'Space Mono', monospace" }}>
              {v.toLocaleString()}
            </span>
          ),
        },
        { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
      ]}
      rows={MOCK.cso.blog}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </>
);
