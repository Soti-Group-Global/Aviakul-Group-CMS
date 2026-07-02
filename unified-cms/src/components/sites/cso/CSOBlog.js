// NAOBlogs.jsx
import CommonRichTextEditor from "../../common/CommonRichTextEditor.jsx";
import { useState, useEffect } from "react";
import { confirmDelete, showToast } from "@/lib/deleteAlert";
import { XIcon, Pencil, Trash2, Plus, Image as ImageIcon, ChevronDown } from "lucide-react";

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
      <Plus size={16} /> Add Blog
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

// ---------- DataTable (light theme, card-like, fixed layout) ----------
const DataTable = ({ columns, rows, accent, onEdit, onDelete }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
    <table className="w-full border-collapse text-sm table-fixed">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-semibold ${col.width || ""}`}
            >
              {col.label}
            </th>
          ))}
          {(onEdit || onDelete) && (
            <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider font-semibold w-[100px]">
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
                className={`px-4 py-3 text-gray-700 align-top ${col.cellClass || ""}`}
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td className="px-4 py-3 text-right align-top">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(row)}
                    className="bg-gray-100 rounded-lg p-1.5 text-gray-600 hover:bg-gray-200 transition"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="bg-red-50 rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
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
        <ChevronDown size={14} />
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
        <ChevronDown size={14} />
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
        <ChevronDown size={14} />
      </div>
    </div>
  </div>
);

// ---------- Modal (light, polished) ----------
const Modal = ({ isOpen, onClose, title, children, isSubmitting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-xl leading-none disabled:opacity-50 transition-colors"
          >
            <XIcon className="w-5 h-5"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
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
    section: "news",
    order: 0,
  });
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // new images to upload
  const [existingImages, setExistingImages] = useState([]); // existing image IDs to keep
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const [tagFilter, setTagFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedDateInput, setPublishedDateInput] = useState("");

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
    setFormData({ title: "", content: "", status: "draft", section: "news", order: 0 });
    setTagsInput("");
    setImageFile(null);
    setImageFiles([]);
    setExistingImages([]);
    setEditingBlog(null);
    setError("");
    setPublishedDateInput("");
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
      section: blog.section || "news",
      order: blog.order || 0,
    });
    setTagsInput((blog.tags || []).join(", "));
    // Set publishedDate for editing (format as YYYY-MM-DDTHH:mm for datetime-local input)
    const dateSource = blog.publishedDate;
    if (dateSource) {
      const d = new Date(dateSource);
      const pad = (n) => String(n).padStart(2, "0");
      setPublishedDateInput(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
    } else {
      setPublishedDateInput("");
    }
    setImageFile(null);
    setImageFiles([]);
    // Load existing images (multi-image support)
    if (blog.imageFileIds && blog.imageFileIds.length > 0) {
      setExistingImages(
        blog.imageFileIds.map((id, idx) => ({
          id: id.toString ? id.toString() : id,
          filename: blog.imageFilenames?.[idx] || `Image ${idx + 1}`,
        }))
      );
    } else if (blog.imageFileId) {
      // Legacy: single image
      setExistingImages([
        {
          id: blog.imageFileId.toString ? blog.imageFileId.toString() : blog.imageFileId,
          filename: blog.imageFilename || "Current image",
        },
      ]);
    } else {
      setExistingImages([]);
    }
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
    payload.append("section", formData.section);
    payload.append("order", formData.order.toString());

    // Multi-image handling
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        payload.append("imageFiles", file);
      });
    }

    // When editing, send the existing images to keep
    if (editingBlog) {
      payload.append("existingImageIds", JSON.stringify(existingImages.map((img) => img.id)));
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    // Always send tags so the API can clear them when the field is emptied
    payload.append("tags", tags.join(","));

    // Send publishedDate only when editing an existing blog
    if (editingBlog) {
      payload.append(
        "publishedDate",
        publishedDateInput ? new Date(publishedDateInput).toISOString() : ""
      );
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
      width: "w-[60px]",
      render: (_, row) => {
        const primaryId =
          row.imageFileIds && row.imageFileIds.length > 0
            ? row.imageFileIds[0]
            : row.imageFileId;
        const count =
          row.imageFileIds && row.imageFileIds.length > 0
            ? row.imageFileIds.length
            : row.imageFileId
              ? 1
              : 0;
        return (
          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
            {primaryId ? (
              <>
                <img
                  src={getImageUrl(primaryId)}
                  alt={row.title}
                  className="w-full h-full object-cover"
                />
                {count > 1 && (
                  <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 rounded-tl">
                    +{count - 1}
                  </span>
                )}
              </>
            ) : (
              <ImageIcon size={18} className="text-gray-400" />
            )}
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Title",
      width: "w-[22%]",
      cellClass: "whitespace-normal",
      render: (v) => (
        <span className="font-medium text-gray-800 line-clamp-2 block leading-snug">
          {v}
        </span>
      ),
    },
    {
      key: "content",
      label: "Content",
      width: "w-[30%]",
      cellClass: "whitespace-normal",
      render: (v) => {
        // Strip HTML tags and truncate to plain text preview
        const plainText = v
          ? v.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
          : "";
        return (
          <span className="text-gray-500 text-xs leading-relaxed line-clamp-2 block">
            {plainText || "—"}
          </span>
        );
      },
    },
    {
      key: "tags",
      label: "Tags",
      width: "w-[12%]",
      cellClass: "whitespace-normal",
      render: (tags) => {
        if (!tags || tags.length === 0) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "section",
      label: "Section",
      width: "w-[10%]",
      render: (v) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize whitespace-nowrap">
          {v || "news"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[10%]",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "publishedDate",
      label: "Published",
      width: "w-[10%]",
      render: (v) => (
        <span className="text-gray-500 text-xs whitespace-nowrap">
          {v ? new Date(v).toLocaleDateString() : "—"}
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
          <ImageIcon size={48} className="text-gray-400 mx-auto" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter blog title"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Content
            </label>
            <div>
              <CommonRichTextEditor
                value={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${editingBlog && formData.status === "published" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Section <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                disabled={isSubmitting}
              >
                <option value="news">News</option>
                <option value="events">Events</option>
                <option value="stories">Stories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                disabled={isSubmitting}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {editingBlog && formData.status === "published" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Published Date
                </label>
                <input
                  type="datetime-local"
                  value={publishedDateInput}
                  onChange={(e) => setPublishedDateInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags <span className="text-gray-400 font-normal">(comma‑separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Images <span className="text-gray-400 font-normal">(multiple allowed)</span>
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setImageFiles((prev) => [...prev, ...files]);
                }}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                disabled={isSubmitting}
              />
            </div>
            {/* Existing images (when editing) */}
            {existingImages.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Existing images ({existingImages.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={getImageUrl(img.id)}
                        alt={img.filename}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExistingImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        disabled={isSubmitting}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        ×
                      </button>
                      <p className="text-[10px] text-gray-400 text-center mt-0.5 max-w-[80px] truncate">
                        {img.filename}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* New images preview */}
            {imageFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  New images to upload ({imageFiles.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImageFiles((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        disabled={isSubmitting}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        ×
                      </button>
                      <p className="text-[10px] text-gray-400 text-center mt-0.5 max-w-[80px] truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => !isSubmitting && setModalOpen(false)}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              {isSubmitting
                ? editingBlog
                  ? "Updating..."
                  : "Creating..."
                : editingBlog
                  ? "Update Blog"
                  : "Create Blog"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
