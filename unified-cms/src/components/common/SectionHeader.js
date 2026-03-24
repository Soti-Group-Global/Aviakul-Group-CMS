// src/components/common/SectionHeader.js
import { Icon } from "./Icon";
import { icons } from "@/lib/icons";

export const SectionHeader = ({ title, count, accent, onAdd }) => (
  <div className="flex justify-between items-center mb-5">
    <div className="flex items-center gap-2.5">
      <h2 className="text-lg font-semibold text-light-text m-0 font-sans">
        {title}
      </h2>
      {count != null && (
        <span
          className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
          style={{ color: accent, backgroundColor: `${accent}18` }}
        >
          {count}
        </span>
      )}
    </div>
    {onAdd && (
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-opacity hover:opacity-85"
        style={{ backgroundColor: accent, color: "#fff" }}
      >
        <Icon d={icons.plus} size={15} /> Add New
      </button>
    )}
  </div>
);
