import { SectionHeader } from "../../common/SectionHeader";
import { Icon } from "../../common/Icon";
import { icons } from "../../../lib/icons";
import { MOCK } from "../../../lib/mockData";

export const TBBTGallery = ({ accent }) => (
  <>
    <SectionHeader
      title="Media Gallery"
      count={MOCK.tbbt.gallery.length}
      accent={accent}
      onAdd={() => {}}
    />
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {MOCK.tbbt.gallery.map((g) => (
        <div
          key={g.id}
          style={{
            flex: "1 1 240px",
            minWidth: 220,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 140,
              background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon d={icons.gallery} size={40} color={`${accent}66`} />
          </div>
          <div style={{ padding: "14px 18px" }}>
            <div
              style={{
                fontWeight: 600,
                color: "#fff",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {g.name}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
                marginTop: 4,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {g.count} items
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
);
