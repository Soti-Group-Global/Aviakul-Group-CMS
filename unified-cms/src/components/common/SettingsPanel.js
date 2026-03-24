// src/components/common/SettingsPanel.js
import { SectionHeader } from "./SectionHeader";

export const SettingsPanel = ({ site, accent }) => (
  <div>
    <SectionHeader title="Site Settings" accent={accent} />
    <div className="flex flex-col gap-3.5 max-w-md">
      {[
        { label: "Site Name", value: site.name },
        { label: "Domain", value: site.domain },
        { label: "Description", value: site.description },
      ].map((f, i) => (
        <div key={i}>
          <div className="text-[11px] text-light-text-muted uppercase tracking-wider mb-1.5">
            {f.label}
          </div>
          <div className="bg-black/5 border border-light-border rounded-lg px-3.5 py-2.5 text-light-text text-sm">
            {f.value}
          </div>
        </div>
      ))}
      <div className="flex gap-2.5 mt-2.5">
        <button
          className="border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer text-white"
          style={{ backgroundColor: accent }}
        >
          Save Changes
        </button>
        <button className="bg-black/10 border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer text-light-text-muted hover:bg-black/20">
          Clear Cache
        </button>
      </div>
    </div>
  </div>
);
