// NAOPartners.jsx
import { useState, useEffect } from "react";

// ---------- Icons ----------
const icons = {
  plus: "M12 4v16m8-8H4",
  edit: "M16.5 3.5L20.5 7.5M4 20L7.5 19L18.5 8L20.5 6L16.5 2L14.5 4L3.5 15L4 20Z",
  trash:
    "M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  globe:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20",
};

const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

// ---------- SectionHeader (same, but you can customize) ----------
const SectionHeader = ({ title, count, accent, onAdd }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-bold text-light-text m-0 font-sans tracking-tight">
        {title}
      </h2>
      {count != null && (
        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/70">
          {count}
        </span>
      )}
    </div>
    {onAdd && (
      <button
        onClick={onAdd}
        className="flex items-center gap-2 border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
        style={{ backgroundColor: accent, color: "#fff" }}
      >
        <Icon d={icons.plus} size={16} /> Add Partner
      </button>
    )}
  </div>
);

// ---------- Modal (same, but with better form styling) ----------
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---------- Main Component with improved UI ----------
export const NAOPartners = ({ accent = "#3b82f6", id: siteId }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Academic Partners",
    order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const categories = [
    "Academic Partners",
    "Industry Partners",
    "Government Partners",
    "Media Partners",
  ];

  const fetchPartners = async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${siteId}/partners?siteId=${siteId}`);
      const json = await res.json();
      if (json.success) setPartners(json.data);
      else console.error("Failed to fetch partners", json.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [siteId]);

  const resetModal = () => {
    setFormData({ name: "", category: "Academic Partners", order: 0 });
    setImageFile(null);
    setEditingPartner(null);
    setError("");
  };

  const openCreateModal = () => {
    resetModal();
    setModalOpen(true);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      category: partner.category,
      order: partner.order || 0,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (partner) => {
    if (!confirm("Delete this partner? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/${siteId}/partners/${partner._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) fetchPartners();
      else alert(json.message);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.category) {
      setError("Name and category are required");
      return;
    }

    if (!editingPartner && (!imageFile || imageFile.size === 0)) {
      setError("Image file is required");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("category", formData.category);
    payload.append("siteId", siteId);
    payload.append("order", formData.order.toString());
    if (imageFile) payload.append("imageFile", imageFile);

    try {
      let url, method;
      if (editingPartner) {
        url = `/api/${siteId}/partners/${editingPartner._id}`;
        method = "PUT";
      } else {
        url = `/api/${siteId}/partners`;
        method = "POST";
      }
      const res = await fetch(url, { method, body: payload });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        fetchPartners();
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const getImageUrl = (fileId) => `/api/files/${fileId}`;

  return (
    <div className="w-full">
      <SectionHeader
        title="Partners"
        count={partners.length}
        accent={accent}
        onAdd={openCreateModal}
      />

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse text-white/50">Loading partners...</div>
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <Icon d={icons.globe} size={48} color="#fff" opacity={0.3} />
          <p className="text-white/40 mt-3">
            No partners yet. Click "Add Partner" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
          {partners.map((partner) => (
            <div
              key={partner._id}
              className="group shadow-xl border-gray-500 relative bg-blue-100 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-blue-300 hover:shadow-xl border border-white/10"
            >
              {/* Image area with better ratio */}
              <div className="relative aspect-square bg-gradient-to-br from-white/5 to-transparent overflow-hidden bg-black-300 flex flex-col justify-center items-center">
                {partner.imageFileId ? (
                  <img
                    src={getImageUrl(partner.imageFileId)}
                    alt={partner.name}
                    className="w-[70%] h-[70%] rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Icon
                      d={icons.globe}
                      size={48}
                      color={accent}
                      opacity={0.5}
                    />
                  </div>
                )}
                {/* Action buttons overlay on image */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEditModal(partner)}
                    className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 transition-all"
                    title="Edit"
                  >
                    <Icon d={icons.edit} size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    className="bg-red-500/70 backdrop-blur-sm rounded-full p-2 text-white hover:bg-red-600 transition-all"
                    title="Delete"
                  >
                    <Icon d={icons.trash} size={14} />
                  </button>
                </div>
              </div>
              {/* Card content */}
              <div className="p-4 text-center">
                <h3 className="font-bold text-black text-sm truncate">
                  Name: {partner.name}
                </h3>
                <p
                  className="text-xs font-medium mt-1"
                  style={{ color: accent }}
                >
                  {partner.category}
                </p>
                {partner.order !== undefined && partner.order !== 0 && (
                  <span className="inline-block mt-2 text-[10px] text-black/70">
                    Order: {partner.order}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal (unchanged styling, but you can improve later) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPartner ? "Edit Partner" : "Add New Partner"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Image {!editingPartner && "*"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {editingPartner && (
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to keep current image.
              </p>
            )}
          </div>
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              {editingPartner ? "Update Partner" : "Create Partner"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
