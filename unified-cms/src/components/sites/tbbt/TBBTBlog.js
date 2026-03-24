import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";


export const TBBTBlog = ({ accent }) => (
  <>
    <SectionHeader
      title="Blog Posts"
      count={MOCK.tbbt.blog.length}
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
      rows={MOCK.tbbt.blog}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </>
);
