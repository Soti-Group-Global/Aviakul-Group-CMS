// src/components/common/StatCard.js
export const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-light-surface border border-light-border rounded-xl p-5 flex-1 min-w-[180px]">
    <div className="text-xs text-light-text-muted uppercase tracking-wide mb-2 font-sans">
      {label}
    </div>
    <div
      className="text-3xl font-bold font-mono leading-tight"
      style={{ color: accent || "var(--text)" }}
    >
      {value}
    </div>
    {sub && (
      <div className="text-xs text-light-text-muted mt-1.5 font-sans">
        {sub}
      </div>
    )}
  </div>
);
