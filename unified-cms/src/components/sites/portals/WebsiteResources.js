import { NAOResources } from "../nao/NAOResources";

export const WebsiteResources = ({ accent, id }) => {
  return <NAOResources accent={accent} id={id} portalType="website" />;
};
