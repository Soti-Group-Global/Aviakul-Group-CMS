import { SectionHeader } from "../../common/SectionHeader";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";

export const CSOTeam = ({ accent }) => (
  <>
    <SectionHeader
      title="Team Members"
      count={MOCK.cso.team.length}
      accent={accent}
      onAdd={() => {}}
    />
    <DataTable
      accent={accent}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "department", label: "Department" },
      ]}
      rows={MOCK.cso.team}
      onEdit={() => {}}
      onDelete={() => {}}
    />
  </>
);
