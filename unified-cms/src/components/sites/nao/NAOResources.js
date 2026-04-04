// NAOResources.jsx
import { useState, useEffect } from "react";

// ---------- Icons ----------
const icons = {
  plus: "M12 4v16m8-8H4",
  edit: "M16.5 3.5L20.5 7.5M4 20L7.5 19L18.5 8L20.5 6L16.5 2L14.5 4L3.5 15L4 20Z",
  trash:
    "M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  file: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7",
};

const Icon = ({ d, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

// ---------- Badge Component (self-contained) ----------
const Badge = ({ status }) => {
  const color = status === "Available" ? "#10b981" : "#f59e0b";
  const bgColor = status === "Available" ? "#d1fae5" : "#fed7aa";
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: bgColor, color }}
    >
      {status}
    </span>
  );
};

// ---------- SectionHeader ----------
const SectionHeader = ({ title, count, accent, onAdd }) => (
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

// ---------- DataTable ----------
const DataTable = ({ columns, rows, accent, onEdit, onDelete }) => (
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

// ---------- Modal ----------
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export const NAOResources = ({ accent = "#3b82f6", id: siteId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "For Schools",
    status: "TBD",
    order: 0,
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  // Category options from model
  const categories = [
    "For Schools",
    "For Students",
    "For Coordinators",
    "Media Resources",
  ];

  // Fetch resources
  const fetchResources = async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${siteId}/resources?siteId=${siteId}`);
      const json = await res.json();
      if (json.success) setResources(json.data);
      else console.error("Failed to fetch resources", json.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [siteId]);

  const resetModal = () => {
    setFormData({
      title: "",
      category: "For Schools",
      status: "TBD",
      order: 0,
    });
    setFile(null);
    setEditingResource(null);
    setError("");
  };

  const openCreateModal = () => {
    resetModal();
    setModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      category: resource.category,
      status: resource.status,
      order: resource.order || 0,
    });
    setFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (resource) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`/api/${siteId}/resources/${resource._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) fetchResources();
      else alert(json.message);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.category) {
      setError("Title and category are required");
      return;
    }

    // Validate file requirement based on status
    if (formData.status === "Available") {
      if (!editingResource && (!file || file.size === 0)) {
        setError("When status is 'Available', a file is required.");
        return;
      }
      if (editingResource && !file && !editingResource.fileId) {
        setError("When status is 'Available', a file is required.");
        return;
      }
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("category", formData.category);
    payload.append("siteId", siteId);
    payload.append("status", formData.status);
    payload.append("order", formData.order.toString());
    if (file) payload.append("file", file);

    try {
      let url, method;
      if (editingResource) {
        url = `/api/${siteId}/resources/${editingResource._id}`;
        method = "PUT";
      } else {
        url = `/api/${siteId}/resources`;
        method = "POST";
      }
      const res = await fetch(url, { method, body: payload });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        fetchResources();
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // Table columns
  const columns = [
    {
      key: "thumbnail",
      label: "File",
      render: (_, row) => (
        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {row.fileId ? (
            <img
              src={`/api/files/${row.fileId}`}
              alt={row.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="text-gray-400">
              <Icon d={icons.file} size={20} />
            </div>
          )}
        </div>
      ),
    },
    { key: "title", label: "Resource" },
    {
      key: "category",
      label: "Category",
      render: (v) => (
        <span className="text-xs font-medium text-gray-600">{v}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <Badge status={v} />,
    },
    { key: "order", label: "Order" },
  ];

  return (
    <>
      <SectionHeader
        title="Resources"
        count={resources.length}
        accent={accent}
        onAdd={openCreateModal}
      />
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <DataTable
          accent={accent}
          columns={columns}
          rows={resources}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResource ? "Edit Resource" : "Add New Resource"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="TBD">TBD</option>
              <option value="Available">Available</option>
            </select>
            {formData.status === "Available" && (
              <p className="text-xs text-amber-600 mt-1">
                File is required when status is Available.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Order (optional)
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 0,
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              File{" "}
              {formData.status === "Available" && !editingResource
                ? "*"
                : "(optional)"}
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm"
            />
            {editingResource && editingResource.fileId && (
              <p className="text-xs text-gray-500 mt-1">
                Current file exists. Leave empty to keep it, or choose a new one
                to replace.
              </p>
            )}
            {editingResource &&
              !editingResource.fileId &&
              formData.status === "Available" && (
                <p className="text-xs text-red-500 mt-1">
                  A file is required because status is Available.
                </p>
              )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: accent }}
            >
              {editingResource ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
