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
import { confirmDelete, showToast } from "@/lib/deleteAlert";

// ---------- Icons ----------
const icons = {
  plus: "M12 4v16m8-8H4",
  edit: "M16.5 3.5L20.5 7.5M4 20L7.5 19L18.5 8L20.5 6L16.5 2L14.5 4L3.5 15L4 20Z",
  trash:
    "M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  grip: "M8 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm0 5a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm0 5a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm8-10a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm0 5a1 1 0 1 1 0 2a1 1 0 0 1 0-2zm0 5a1 1 0 1 1 0 2a1 1 0 0 1 0-2z",

  file: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
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

const categoryStyles = {
  "For Schools": { header: "bg-orange-500" },
  "For Students": { header: "bg-green-500" },
  "For Coordinators": { header: "bg-teal-500" },
  "Media Resources": { header: "bg-blue-600" },
};

// ---------- Sortable Resource Row ----------
const SortableResourceItem = ({ resource, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group w-full py-2 px-1 flex items-center text-black border-b border-gray-400 ${isDragging ? "shadow-lg ring-2 ring-blue-100" : ""}`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing group-hover:text-gray-700 transition-colors"
      >
        <Icon d={icons.grip} size={16} />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0 ml-2">
        <p
          className="text-sm font-semibold break-words leading-tight"
          title={resource.title}
        >
          {resource.title}
        </p>
      </div>

      {/* Download button (optional) */}
      <div className="flex gap-1 items-center mx-1">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 bg-blue-50 transition-all"
          title="Download"
        >
          <Icon d={icons.download} size={14} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-end gap-2">
        <button
          onClick={() => onEdit(resource)}
          className="flex items-center justify-center text-amber-500 bg-amber-50 transition-all p-1.5 rounded-lg"
          title="Edit"
        >
          <Icon d={icons.edit} size={14} />
        </button>
        <button
          onClick={() => onDelete(resource)}
          className="flex items-center justify-center text-red-500 bg-red-50 transition-all p-1.5 rounded-lg"
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
  resources,
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
      const oldIndex = resources.findIndex((r) => r._id === active.id);
      const newIndex = resources.findIndex((r) => r._id === over.id);
      onReorder?.(category, arrayMove(resources, oldIndex, newIndex));
    }
  };

  const style = categoryStyles[category];

  if (resources.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm h-full">
        <div
          className={`${style.header} text-white px-4 py-3 flex items-center justify-between font-semibold`}
        >
          <span>{category}</span>
          <button
            onClick={() => onAdd?.(category)}
            className="flex items-center gap-1 text-sm text-white/90 hover:text-white"
          >
            <Icon d={icons.plus} size={14} /> Add
          </button>
        </div>
        <p className="text-gray-400 text-sm py-4 text-center">
          No resources in this category.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={resources.map((r) => r._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
          <div
            className={`${style.header} text-white px-4 py-3 flex items-center justify-between font-semibold`}
          >
            <span>{category}</span>
            <button
              onClick={() => onAdd?.(category)}
              className="flex items-center gap-1 text-sm text-white/90 hover:text-white"
            >
              <Icon d={icons.plus} size={14} /> Add
            </button>
          </div>
          <div className="flex-1 py-2">
            {resources.map((resource) => (
              <SortableResourceItem
                key={resource._id}
                resource={resource}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

// ---------- Modal (updated to accept isSubmitting) ----------
const Modal = ({ isOpen, onClose, title, children, isSubmitting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 sticky top-0 bg-white py-2">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
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
export const NAOResources = ({
  accent = "#3b82f6",
  id: siteId,
  portalType,
  title = "Downloadable Resources",
}) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("For Schools");
  const [formData, setFormData] = useState({
    title: "",
    category: "For Schools",
    order: 0,
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // ADDED

  // console.log("portalType FE:", portalType);

  const categories = [
    "For Schools",
    "For Students",
    "For Coordinators",
    "Media Resources",
  ];

  const resourcesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = resources
      .filter((r) => r.category === cat)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  const fetchResources = async () => {
    if (!siteId) return;
    setLoading(true);
    const url = portalType
      ? `/api/${siteId}/resources?siteId=${siteId}&portalType=${portalType}`
      : `/api/${siteId}/resources?siteId=${siteId}`;
    try {
      const res = await fetch(url);
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
  }, [portalType, siteId]);

  const updateOrderForCategory = async (category, reorderedResources) => {
    const updates = reorderedResources.map((r, idx) => ({
      _id: r._id,
      order: idx,
    }));
    if (updates.length === 0) return;
    setResources((prev) => {
      const other = prev.filter((r) => r.category !== category);
      const updated = reorderedResources.map((r, idx) => ({
        ...r,
        order: idx,
      }));
      return [...other, ...updated];
    });
    try {
      const res = await fetch(`/api/${siteId}/resources/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          updates,
          ...(portalType ? { portalType } : {}),
        }),
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (err) {
      console.error(err);
      fetchResources();
    }
  };

  const resetModal = () => {
    setFormData({ title: "", category: selectedCategory, order: 0 });
    setFile(null);
    setEditingResource(null);
    setError("");
  };

  const openCreateModal = (category = "For Schools") => {
    setSelectedCategory(category);
    setFormData({ title: "", category, order: 0 });
    setFile(null);
    setEditingResource(null);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setSelectedCategory(resource.category);
    setFormData({
      title: resource.title,
      category: resource.category,
      order: resource.order || 0,
    });
    setFile(null);
    setError("");
    setModalOpen(true);
  };

  const handleDelete = async (resource) => {
    const confirmed = await confirmDelete(
      `Delete "${resource.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/${siteId}/resources/${resource._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchResources();
        showToast("Resource deleted successfully");
      } else {
        showToast(json.message, "error");
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setError("");
    if (!formData.title || !formData.category) {
      setError("Title and category are required");
      return;
    }

    setIsSubmitting(true); // Disable button

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("category", formData.category);
    payload.append("siteId", siteId);
    payload.append("order", formData.order.toString());
    if (file) payload.append("file", file);

    payload.append("portalType", portalType || "");

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
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-600">{title}</h1>
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Icon d={icons.plus} size={16} /> Add Resource
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-pulse text-gray-400">
            Loading resources...
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              resources={resourcesByCategory[cat] || []}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onAdd={openCreateModal}
              onReorder={updateOrderForCategory}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        title={editingResource ? "Edit Resource" : "Add New Resource"}
        isSubmitting={isSubmitting}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
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
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
              disabled={isSubmitting}
            />
            {editingResource && editingResource.fileId && (
              <p className="text-xs text-gray-500 mt-1">
                Current file exists. Leave empty to keep it, or choose a new one
                to replace.
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
              onClick={() => !isSubmitting && setModalOpen(false)}
              disabled={isSubmitting}
              className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {isSubmitting
                ? editingResource
                  ? "Updating..."
                  : "Creating..."
                : editingResource
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
