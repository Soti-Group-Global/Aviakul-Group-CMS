import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";

export const CSOInquiries = ({ accent }) => (
  <>
    <SectionHeader
      title="Get Involved — Inquiries"
      count={MOCK.cso.inquiries.length}
      accent={accent}
    />
    <DataTable
      accent={accent}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "type", label: "Type" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
      ]}
      rows={MOCK.cso.inquiries}
      onEdit={() => {}}
    />
  </>
);
