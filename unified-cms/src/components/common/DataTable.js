// src/components/common/DataTable.js
import { Icon } from "./Icon";
import { icons } from "@/lib/icons";

export const DataTable = ({ columns, rows, accent, onEdit, onDelete }) => (
  <div className="overflow-x-auto rounded-xl border border-light-border">
    <table className="w-full border-collapse text-sm font-sans">
      <thead>
        <tr className="bg-black/5">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-3 text-left text-xs text-light-text-muted uppercase tracking-wider font-medium border-b border-light-border whitespace-nowrap"
            >
              {col.label}
            </th>
          ))}
          {(onEdit || onDelete) && (
            <th className="px-4 py-3 text-right text-xs text-light-text-muted uppercase tracking-wider font-medium border-b border-light-border">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr
            key={ri}
            className="border-b border-light-border hover:bg-black/5 transition-colors"
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className="px-4 py-3 text-light-text whitespace-nowrap"
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex gap-1.5 justify-end">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="bg-black/10 border-none rounded p-1.5 cursor-pointer text-light-text-muted hover:bg-black/20"
                    >
                      <Icon d={icons.edit} size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="bg-red-100 border-none rounded p-1.5 cursor-pointer text-red-400 hover:bg-red-200"
                    >
                      <Icon d={icons.trash} size={14} />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
