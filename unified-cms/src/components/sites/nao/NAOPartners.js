import { SectionHeader } from "../../common/SectionHeader";
import { Icon } from "../../common/Icon";
import { icons } from "../../../lib/icons";
import { MOCK } from "../../../lib/mockData";

export const NAOPartners = ({ accent }) => (
  <>
    <SectionHeader
      title="Partners"
      count={MOCK.nao.partners.length}
      accent={accent}
      onAdd={() => {}}
    />
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {MOCK.nao.partners.map((p) => (
        <div
          key={p.id}
          style={{
            flex: "1 1 200px",
            minWidth: 180,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
            padding: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `${accent}22`,
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon d={icons.globe} size={24} color={accent} />
          </div>
          <div
            style={{
              fontWeight: 600,
              color: "#fff",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {p.name}
          </div>
          <div
            style={{
              color: accent,
              fontSize: 12,
              marginTop: 4,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {p.tier}
          </div>
        </div>
      ))}
    </div>
  </>
);
