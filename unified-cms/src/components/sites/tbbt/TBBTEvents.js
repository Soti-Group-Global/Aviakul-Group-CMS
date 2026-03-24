import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";

export const TBBTEvents = ({ accent }) => (
  <>
    <SectionHeader
      title="Events"
      count={MOCK.tbbt.events.length}
      accent={accent}
      onAdd={() => {}}
    />
    <DataTable
      accent={accent}
      columns={[
        { key: "title", label: "Event Name" },
        { key: "date", label: "Date" },
        { key: "venue", label: "Venue" },
        {
          key: "tickets",
          label: "Tickets",
          render: (v, r) => (
            <span style={{ fontFamily: "'Space Mono', monospace" }}>
              {v}/{r.capacity}
            </span>
          ),
        },
        { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
      ]}
      rows={MOCK.tbbt.events}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </>
);
