import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { confirmDelete,showToast } from "@/lib/deleteAlert";

// ---------- Icons ----------
const icons = {
  plus: "M12 4v16m8-8H4",
  edit: "M16.5 3.5L20.5 7.5M4 20L7.5 19L18.5 8L20.5 6L16.5 2L14.5 4L3.5 15L4 20Z",
  trash:
    "M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  grip: "M3 12h18M3 6h18M3 18h18",
  image:
    "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
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

// ---------- Sortable Partner Card (grid item) ----------
const SortablePartnerCard = ({ partner, onEdit, onDelete, color }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: partner._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const getImageUrl = (fileId) => `/api/files/${fileId}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative bg-gray-100 rounded-xl p-3 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition group cursor-grab active:cursor-grabbing`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-2 left-2 text-gray-500 opacity-0 group-hover:opacity-100 transition"
      >
        <Icon d={icons.grip} size={16} />
      </div>

      {/* Image - increased to h-24 w-24 (96px) */}
      <div className="h-34 w-34 flex items-center justify-center mb-4">
        {partner.imageFileId ? (
          <div className="w-30 h-30 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
            <img
              src={getImageUrl(partner.imageFileId)}
              alt={partner.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="text-gray-400">
            <Icon d={icons.image} size={48} />
          </div>
        )}
      </div>

      {/* Partner name */}
      <span className="text-gray-800 font-medium text-sm text-center">
        {partner.name}
      </span>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => onEdit(partner)}
          className="bg-blue-200 p-1 rounded shadow hover:bg-gray-100"
          title="Edit"
        >
          <Icon d={icons.edit} size={14} />
        </button>
        <button
          onClick={() => onDelete(partner)}
          className="bg-red-200 p-1 rounded shadow hover:bg-gray-100"
          title="Delete"
        >
          <Icon d={icons.trash} size={14} />
        </button>
      </div>
    </div>
  );
};

// ---------- Category Section ----------
const CategorySection = ({
  category,
  partners,
  onEdit,
  onDelete,
  onReorder,
  onAdd,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = partners.findIndex((p) => p._id === active.id);
      const newIndex = partners.findIndex((p) => p._id === over.id);
      onReorder?.(category, arrayMove(partners, oldIndex, newIndex));
    }
  };

  const cardColors = ["bg-[#cfe8e8]", "bg-[#d8e6e8]", "bg-[#f3d98b]"];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
        <h3 className="text-center text-gray-700 font-medium mb-4">
          {category}
        </h3>
        <button
          onClick={() => onAdd?.(category)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Icon d={icons.plus} size={14} /> Add
        </button>
      </div>
      {partners.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">
          No partners in this category.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={partners.map((p) => p._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {partners.map((partner, index) => (
                <SortablePartnerCard
                  key={partner._id}
                  partner={partner}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  color={cardColors[index % cardColors.length]}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

// ---------- Modal (unchanged) ----------
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 sticky top-0 bg-white py-2">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
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
export const NAOPartners = ({ accent = "#3b82f6", id: siteId }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Academic Partners");
  const [formData, setFormData] = useState({
    name: "",
    category: "Academic Partners",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const categories = [
    "Academic Partners",
    "Industry Partners",
    "Government Partners",
    "Media Partners",
  ];

  const partnersByCategory = categories.reduce((acc, cat) => {
    acc[cat] = partners
      .filter((p) => p.category === cat)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  const fetchPartners = async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${siteId}/partners?siteId=${siteId}`);
      const json = await res.json();
      if (json.success) setPartners(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [siteId]);

  const updateOrderForCategory = async (category, reorderedPartners) => {
    const updates = reorderedPartners.map((partner, idx) => ({
      _id: partner._id,
      order: idx,
    }));
    setPartners((prev) => {
      const otherPartners = prev.filter((p) => p.category !== category);
      const updatedPartners = reorderedPartners.map((p, idx) => ({
        ...p,
        order: idx,
      }));
      return [...otherPartners, ...updatedPartners];
    });
    try {
      const res = await fetch(`/api/${siteId}/partners/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, updates }),
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (err) {
      console.error(err);
      fetchPartners();
    }
  };

  const openCreateModal = (category = "Academic Partners") => {
    setSelectedCategory(category);
    setFormData({ name: "", category });
    setImageFile(null);
    setEditingPartner(null);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setSelectedCategory(partner.category);
    setFormData({ name: partner.name, category: partner.category });
    setImageFile(null);
    setError("");
    setModalOpen(true);
  };

  const handleDelete = async (partner) => {
    const confirmed = await confirmDelete(
      `Delete "${partner.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/${siteId}/partners/${partner._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchPartners();
        showToast("Partner deleted successfully");
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.log("Delete failed", err.message)
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 text-orange-500">
          Partner Organizations
        </h1>
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Icon d={icons.plus} size={16} /> Add Partner
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-pulse text-gray-400">Loading partners...</div>
        </div>
      ) : (
        categories.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            partners={partnersByCategory[cat] || []}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onAdd={openCreateModal}
            onReorder={updateOrderForCategory}
          />
        ))
      )}

      {/* Modal */}
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
              {editingPartner ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
