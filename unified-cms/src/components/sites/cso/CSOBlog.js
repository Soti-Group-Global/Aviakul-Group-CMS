// NAOBlogs.jsx
import CommonRichTextEditor from "../../common/CommonRichTextEditor.jsx";
import { useState, useEffect } from "react";
import { confirmDelete, showToast } from "@/lib/deleteAlert";

// ---------- Icons ----------
const icons = {
  plus: "M12 4v16m8-8H4",
  edit: "M16.5 3.5L20.5 7.5M4 20L7.5 19L18.5 8L20.5 6L16.5 2L14.5 4L3.5 15L4 20Z",
  trash:
    "M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  image:
    "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  chevronDown: "M6 9l6 6 6-6",
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

// ---------- SectionHeader (light theme) ----------
const SectionHeader = ({ title, count, accent, onAdd }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-3">
      <h2 className="text-2xl font-bold text-gray-800 m-0 font-sans tracking-tight">
        {title}
      </h2>
      {count != null && (
        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {count}
        </span>
      )}
    </div>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-all hover:shadow-md active:scale-95 shadow-sm"
      style={{ backgroundColor: accent, color: "#fff" }}
    >
      <Icon d={icons.plus} size={16} /> Add Blog
    </button>
  </div>
);

// ---------- Status Badge (light theme) ----------
const StatusBadge = ({ status }) => {
  const config = {
    draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
    published: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Published",
    },
    archived: { bg: "bg-red-100", text: "text-red-700", label: "Archived" },
  };
  const { bg, text, label } = config[status] || config.draft;
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
};

// ---------- DataTable (light theme, card-like) ----------
const DataTable = ({ columns, rows, accent, onEdit, onDelete }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap"
            >
              {col.label}
            </th>
          ))}
          {(onEdit || onDelete) && (
            <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr
            key={ri}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className="px-4 py-3 text-gray-700 whitespace-nowrap"
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(row)}
                    className="bg-gray-100 rounded-lg p-1.5 text-gray-600 hover:bg-gray-200 transition"
                    title="Edit"
                  >
                    <Icon d={icons.edit} size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="bg-red-50 rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition"
                    title="Delete"
                  >
                    <Icon d={icons.trash} size={14} />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ---------- Filter Bar (light theme) – with tag filter added ----------
const FilterBar = ({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  tagFilter,
  setTagFilter,
  uniqueTags,
  accent,
}) => (
  <div className="flex gap-3 mb-5 flex-wrap">
    <div className="relative">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <Icon d={icons.chevronDown} size={12} />
      </div>
    </div>
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="order">Sort by Order</option>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <Icon d={icons.chevronDown} size={12} />
      </div>
    </div>
    {/* Tag filter dropdown */}
    <div className="relative">
      <select
        value={tagFilter}
        onChange={(e) => setTagFilter(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Tags</option>
        {uniqueTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <Icon d={icons.chevronDown} size={12} />
      </div>
    </div>
  </div>
);

// ---------- Modal (already light friendly, keep as is) ----------
const Modal = ({ isOpen, onClose, title, children, isSubmitting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6 md:p-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-5 relative animate-in fade-in zoom-in duration-200 max-h-[94vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5  top-0 bg-white py-2">
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
export const CSOBlog = ({ accent = "#3b82f6", id: siteId }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "draft",
    order: 0,
  });
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const [tagFilter, setTagFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive unique tags from blogs
  const uniqueTags = Array.from(
    new Set(blogs.flatMap((blog) => blog.tags || [])),
  ).sort();

  const fetchBlogs = async () => {
    if (!siteId) return;

    setLoading(true);

    try {
      const params = new URLSearchParams();

      // Status filter
      if (statusFilter !== "all") {
        params.append("statusFilter", statusFilter);
      }

      //  Sort
      if (sortBy) {
        params.append("sort", sortBy);
      }

      // Tag filter
      if (tagFilter) {
        params.append("tagFilter", tagFilter);
      }

      // // (Optional) Search
      // if (searchTerm) {
      //   params.append("searchTerm", searchTerm);
      // }

      const url = `/api/${siteId}/blogs?${params.toString()}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setBlogs(json.data);
      } else {
        console.error("Failed to fetch blogs", json.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter, sortBy, tagFilter]);

  const resetModal = () => {
    setFormData({ title: "", content: "", status: "draft", order: 0 });
    setTagsInput("");
    setImageFile(null);
    setEditingBlog(null);
    setError("");
  };

  const openCreateModal = () => {
    resetModal();
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content || "",
      status: blog.status,
      order: blog.order || 0,
    });
    setTagsInput((blog.tags || []).join(", "));
    setImageFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (blog) => {
    const confirmed = await confirmDelete(
      `Delete "${blog.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/${siteId}/blogs/${blog._id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        fetchBlogs();
        showToast("Blog deleted successfully");
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

    if (!formData.title) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("content", formData.content);
    payload.append("siteId", siteId);
    payload.append("status", formData.status);
    payload.append("order", formData.order.toString());
    if (imageFile) payload.append("imageFile", imageFile);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length) {
      payload.append("tags", tags.join(","));
    }

    try {
      let url, method;
      if (editingBlog) {
        url = `/api/${siteId}/blogs/${editingBlog._id}`;
        method = "PUT";
      } else {
        url = `/api/${siteId}/blogs`;
        method = "POST";
      }
      const res = await fetch(url, { method, body: payload });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        fetchBlogs();
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (fileId) => `/api/files/${fileId}`;

  const columns = [
    {
      key: "thumbnail",
      label: "Image",
      render: (_, row) => (
        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {row.imageFileId ? (
            <img
              src={getImageUrl(row.imageFileId)}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon d={icons.image} size={18} color="#9ca3af" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (v) => <span className="font-medium text-gray-800">{v}</span>,
    },
    {
      key: "content",
      label: "Content",
      render: (v) => (
        <div
          className="text-gray-500 text-xs max-w-xs prose prose-xs"
          dangerouslySetInnerHTML={{ __html: v || "—" }}
        />
      ),
    },
    {
      key: "tags",
      label: "Tags",
      render: (tags) => {
        if (!tags || tags.length === 0) return "—";
        return (
          <div className="flex flex-col gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v) => (
        <span className="text-gray-500 text-xs">
          {new Date(v).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <SectionHeader
        title="Blogs"
        count={blogs.length}
        accent={accent}
        onAdd={openCreateModal}
      />
      <FilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        uniqueTags={uniqueTags}
        accent={accent}
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-pulse text-gray-400">Loading blogs...</div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Icon d={icons.image} size={48} color="#9ca3af" />
          <p className="text-gray-400 mt-3">
            No blogs match the selected filters.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={blogs}
          accent={accent}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        title={editingBlog ? "Edit Blog" : "Create New Blog"}
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <div className="resize-y overflow-auto min-h-[180px] max-h-[600px] border border-gray-200 rounded-lg">
              <CommonRichTextEditor
                value={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              disabled={isSubmitting}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              {/* <option value="archived">Archived</option> */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma‑separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="eg: tag1, tag2, tag3"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isSubmitting}
            />
            {editingBlog && editingBlog.imageFileId && (
              <p className="text-xs text-black-900 mt-1 font-bold">
                Current file:{" "}
                <span className="text-gray-500">
                  {editingBlog.imageFilename}
                </span>
                {/* Current image will be kept if you leave this empty. */}
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
              className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {isSubmitting
                ? editingBlog
                  ? "Updating..."
                  : "Creating..."
                : editingBlog
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
