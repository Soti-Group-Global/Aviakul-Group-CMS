import { NAOResources } from "../nao/NAOResources";

export const StudentResources = ({ accent, id }) => {
  return (
    <NAOResources
      accent={accent}
      id={id}
      portalType="student"
      title="Student Downloadable Resources"
    />
  );
};
