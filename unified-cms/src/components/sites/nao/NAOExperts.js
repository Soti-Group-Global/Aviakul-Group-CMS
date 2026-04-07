// NAOexperts.jsx
import { useState, useEffect } from "react";
import { confirmDelete, showToast } from "@/lib/deleteAlert";

// ---------- Icons ----------
const icons = {
  plus: "M12 4v16m8-8H4",
  edit: "M16.5 3.5L20.5 7.5M4 20L7.5 19L18.5 8L20.5 6L16.5 2L14.5 4L3.5 15L4 20Z",
  trash:
    "M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
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

// ---------- Modal (updated to accept isSubmitting) ----------
const Modal = ({ isOpen, onClose, title, children, isSubmitting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50"
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
export const NAOExperts = ({ accent = "#3b82f6", id }) => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    organization: "",
    location: "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // ADDED

  // Fetch experts: GET /api/{id}/experts?siteId={id}
  const fetchExperts = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${id}/experts?siteId=${id}`);
      const json = await res.json();
      if (json.success) setExperts(json.data);
      else console.error("Failed to fetch experts", json.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const resetModal = () => {
    setFormData({ name: "", designation: "", organization: "", location: "" });
    setProfileFile(null);
    setEditingExpert(null);
    setError("");
  };

  const openCreateModal = () => {
    resetModal();
    setModalOpen(true);
  };

  const openEditModal = (expert) => {
    setEditingExpert(expert);
    setFormData({
      name: expert.name,
      designation: expert.designation,
      organization: expert.organization,
      location: expert.location,
    });
    setProfileFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (expert) => {
    const confirmed = await confirmDelete(
      `Delete "${expert.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/${id}/experts/${expert._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchExperts();
        showToast("Expert deleted successfully");
      } else {
        showToast(json.message, "error");
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 
    setError("");

    if (
      !formData.name ||
      !formData.designation ||
      !formData.organization ||
      !formData.location
    ) {
      setError("All text fields are required");
      return;
    }
    if (!editingExpert && (!profileFile || profileFile.size === 0)) {
      setError("Profile image is required for new expert");
      return;
    }

    setIsSubmitting(true); 

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("designation", formData.designation);
    payload.append("organization", formData.organization);
    payload.append("location", formData.location);
    payload.append("siteId", id);
    if (profileFile) payload.append("profileFile", profileFile);

    try {
      let url, method;
      if (editingExpert) {
        // PUT /api/{id}/experts/{expertId}
        url = `/api/${id}/experts/${editingExpert._id}`;
        method = "PUT";
      } else {
        // POST /api/{id}/experts
        url = `/api/${id}/experts`;
        method = "POST";
      }
      const res = await fetch(url, { method, body: payload });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        fetchExperts();
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsSubmitting(false); 
    }
  };

  // Table columns with thumbnail image
  const columns = [
    {
      key: "thumbnail",
      label: "Image",
      render: (_, row) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {row.profileFileId ? (
            <img
              src={`/api/files/${row.profileFileId}`}
              alt={row.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
              No img
            </div>
          )}
        </div>
      ),
    },
    { key: "name", label: "Name" },
    { key: "designation", label: "Title / Designation" },
    { key: "organization", label: "Organization" },
    { key: "location", label: "Location" },
  ];

  return (
    <>
      <SectionHeader
        title="Expert Panel"
        count={experts.length}
        accent={accent}
        onAdd={openCreateModal}
      />
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <DataTable
          accent={accent}
          columns={columns}
          rows={experts}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        title={editingExpert ? "Edit Expert" : "Add New Expert"}
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Designation *
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Organization *
            </label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Image {!editingExpert && "*"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isSubmitting}
            />
            {editingExpert && (
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep current image, or choose a new one to
                replace.
              </p>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => !isSubmitting && setModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {isSubmitting
                ? editingExpert
                  ? "Updating..."
                  : "Creating..."
                : editingExpert
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
