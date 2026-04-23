import { NAOResources } from "../nao/NAOResources";

export const SchoolResources = ({ accent, id }) => {
  return (
    <NAOResources
      accent={accent}
      id={id}
      portalType="school"
      title="School Downloadable Resources"
    />
  );
};
