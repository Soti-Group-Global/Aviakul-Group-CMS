// src/components/common/Badge.js
export const Badge = ({ status, map }) => {
  const defaultMap = {
    published: {
      bg: "rgba(16,185,129,0.12)",
      color: "#34d399",
      label: "Published",
    },
    draft: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Draft" },
    active: { bg: "rgba(16,185,129,0.12)", color: "#34d399", label: "Active" },
    upcoming: {
      bg: "rgba(99,102,241,0.12)",
      color: "#818cf8",
      label: "Upcoming",
    },
    completed: {
      bg: "rgba(0,0,0,0.06)",
      color: "rgba(0,0,0,0.4)",
      label: "Completed",
    },
    shipped: {
      bg: "rgba(59,130,246,0.12)",
      color: "#60a5fa",
      label: "Shipped",
    },
    processing: {
      bg: "rgba(251,191,36,0.12)",
      color: "#fbbf24",
      label: "Processing",
    },
    delivered: {
      bg: "rgba(16,185,129,0.12)",
      color: "#34d399",
      label: "Delivered",
    },
    out_of_stock: {
      bg: "rgba(239,68,68,0.12)",
      color: "#f87171",
      label: "Out of Stock",
    },
    low_stock: {
      bg: "rgba(251,146,60,0.12)",
      color: "#fb923c",
      label: "Low Stock",
    },
    new: { bg: "rgba(99,102,241,0.12)", color: "#818cf8", label: "New" },
    replied: {
      bg: "rgba(16,185,129,0.12)",
      color: "#34d399",
      label: "Replied",
    },
    planning: {
      bg: "rgba(251,191,36,0.12)",
      color: "#fbbf24",
      label: "Planning",
    },
    coming_soon: {
      bg: "rgba(168,85,247,0.12)",
      color: "#c084fc",
      label: "Coming Soon",
    },
    ...(map || {}),
  };
  const s = defaultMap[status] || {
    bg: "rgba(0,0,0,0.06)",
    color: "rgba(0,0,0,0.4)",
    label: status,
  };
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};
