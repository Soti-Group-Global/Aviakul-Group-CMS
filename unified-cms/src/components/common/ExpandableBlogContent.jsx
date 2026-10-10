"use client";
import { useState } from "react";

export default function ExpandableBlogContent({ content }) {
  const [expanded, setExpanded] = useState(false);
  const plain = (content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return <span className="text-gray-400">—</span>;
  return (
    <div className="min-w-[180px] max-w-[420px] whitespace-normal">
      <p
        className={`text-gray-500 text-xs leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
      >
        {plain}
      </p>
      {plain.length > 120 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
