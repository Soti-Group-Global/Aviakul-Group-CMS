import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import { Extension } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {
  Code,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Link as LinkIcon,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RemoveFormatting,
  Table as TableIcon,
  Trash2,
  Indent,
  Outdent,
  TableColumnsSplit,
  TableRowsSplit,
  BetweenHorizontalStart,
  BetweenHorizontalEnd,
  BetweenVerticalStart,
  BetweenVerticalEnd,
  ImagePlus,
  Quote,
} from "lucide-react";
import "./RichTextEditor.css";

const ParagraphLineHeight = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      lineHeight: {
        default: null,
        parseHTML: (element) => element.style.lineHeight || null,
        renderHTML: (attributes) =>
          attributes.lineHeight
            ? { style: `line-height: ${attributes.lineHeight}` }
            : {},
      },
    };
  },
});

// In-editor image controls are rendered as part of each image node, so users do not
// need to select the image first to remove it.
const ArticleImageNodeView = ({ node, deleteNode }) => (
  <NodeViewWrapper
    as="figure"
    className="article-image-figure rte-image-node"
    contentEditable={false}
  >
    <div className="rte-image-node-media">
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || undefined}
      />
      <button
        type="button"
        className="rte-image-delete"
        title="Delete image, caption and credit"
        aria-label="Delete image, caption and credit"
        onMouseDown={(event) => event.preventDefault()}
        onClick={deleteNode}
      >
        <Trash2 size={14} />
      </button>
    </div>
    {(node.attrs.caption || node.attrs.credit) && (
      <figcaption>
        {node.attrs.caption && (
          <span data-image-caption="true" className="article-image-caption">
            {node.attrs.caption}
          </span>
        )}
        {node.attrs.credit && (
          <span data-image-credit="true" className="article-image-credit">
            {node.attrs.credit}
          </span>
        )}
      </figcaption>
    )}
  </NodeViewWrapper>
);

// Block-level article images keep their caption and photographer/source credit in the
// saved HTML, so they survive editing and publication without a schema change.
const ArticleImage = Image.extend({
  // Figure/caption is a block-level structure; rendering it as an inline image
  // creates invalid <p><figure> markup that browsers normalize and may strip.
  inline: false,
  group: "block",
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (element) =>
          element
            .closest("figure")
            ?.querySelector("figcaption [data-image-caption]")?.textContent ||
          element.getAttribute("data-caption") ||
          null,
        renderHTML: (attributes) =>
          attributes.caption ? { "data-caption": attributes.caption } : {},
      },
      credit: {
        default: null,
        parseHTML: (element) =>
          element
            .closest("figure")
            ?.querySelector("figcaption [data-image-credit]")?.textContent ||
          element.getAttribute("data-credit") ||
          null,
        renderHTML: (attributes) =>
          attributes.credit ? { "data-credit": attributes.credit } : {},
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    // Tiptap's HTMLAttributes contains the serialized data-caption/data-credit
    // attributes, not the original `caption`/`credit` attribute names. Read the
    // metadata from node.attrs so it is actually rendered inside <figcaption>.
    const caption = (node?.attrs?.caption || "").trim();
    const credit = (node?.attrs?.credit || "").trim();
    const imageAttributes = { ...HTMLAttributes };
    delete imageAttributes["data-caption"];
    delete imageAttributes["data-credit"];

    const image = [
      "img",
      {
        ...imageAttributes,
        ...(caption ? { "data-caption": caption } : {}),
        ...(credit ? { "data-credit": credit } : {}),
      },
    ];

    if (!caption && !credit) return image;

    return [
      "figure",
      { class: "article-image-figure" },
      image,
      [
        "figcaption",
        {},
        ...(caption
          ? [
              [
                "span",
                {
                  "data-image-caption": "true",
                  class: "article-image-caption",
                },
                caption,
              ],
            ]
          : []),
        ...(credit
          ? [
              [
                "span",
                { "data-image-credit": "true", class: "article-image-credit" },
                credit,
              ],
            ]
          : []),
      ],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ArticleImageNodeView);
  },
  parseHTML() {
    return [
      // Parse the entire figure as a single image node. Matching the nested img
      // directly lets ProseMirror also visit the figcaption text as regular
      // document content, which duplicates captions/credits after reopening.
      {
        tag: "figure.article-image-figure",
        getAttrs: (figure) => {
          const image = figure.querySelector("img[src]");
          if (!image) return false;
          return {
            src: image.getAttribute("src"),
            alt: image.getAttribute("alt") || null,
            title: image.getAttribute("title") || null,
            caption:
              figure
                .querySelector("figcaption [data-image-caption]")
                ?.textContent?.trim() ||
              image.getAttribute("data-caption") ||
              null,
            credit:
              figure
                .querySelector("figcaption [data-image-credit]")
                ?.textContent?.trim() ||
              image.getAttribute("data-credit") ||
              null,
          };
        },
      },
      // Keep compatibility with older content that stored a plain image.
      { tag: "img[src]" },
    ];
  },
});

/* ─── Preset colors ─── */
const COLOR_PRESETS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#cccccc",
  "#efefef",
  "#ffffff",
  "#e74c3c",
  "#e67e22",
  "#f1c40f",
  "#2ecc71",
  "#1abc9c",
  "#3498db",
  "#9b59b6",
  "#c0392b",
  "#d35400",
  "#f39c12",
  "#27ae60",
  "#16a085",
  "#2980b9",
  "#8e44ad",
];

/* ═══════════════════════════════════════════════════════════
   Toolbar
   ═══════════════════════════════════════════════════════════ */
const CommonToolbar = ({ editor }) => {
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const colorRef = useRef(null);
  const bgColorRef = useRef(null);
  const imageInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [imageCredit, setImageCredit] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const handler = (e) => {
      if (colorRef.current && !colorRef.current.contains(e.target))
        setShowColorPicker(false);
      if (bgColorRef.current && !bgColorRef.current.contains(e.target))
        setShowBgColorPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!editor) return null;

  const toggleSource = () => {
    if (!showSource) {
      setSourceHtml(editor.getHTML());
      setShowSource(true);
    } else {
      editor.commands.setContent(sourceHtml);
      setShowSource(false);
    }
  };

  const btn = (active, onClick, icon, title) => (
    <button
      type="button"
      className={`rte-btn${active ? " rte-btn--active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {icon}
    </button>
  );

  const sep = () => <span className="rte-sep" />;

  const insertArticleImage = (file) => {
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      setImageDialogOpen(true);
      return;
    }
    setImageError("");
    setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
    setImageCaption("");
    setImageCredit("");
    setImageDialogOpen(true);
  };

  const closeImageDialog = () => {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
    setImageDialogOpen(false);
    setImageError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const uploadAndInsertImage = async () => {
    if (!pendingImage?.file || !editor) return;
    setImageUploading(true);
    setImageError("");
    try {
      const body = new FormData();
      body.append("file", pendingImage.file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.success || !result.fileId) {
        throw new Error(result.message || "Image upload failed.");
      }
      editor
        .chain()
        .focus()
        .setImage({
          src: `${window.location.origin}/api/files/${result.fileId}`,
          alt: imageCaption.trim() || pendingImage.file.name,
          title: imageCaption.trim() || null,
          caption: imageCaption.trim() || null,
          credit: imageCredit.trim() || null,
        })
        .run();
      closeImageDialog();
    } catch (error) {
      setImageError(
        error.message || "Could not upload image. Please try again.",
      );
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <>
      <div className="rte-toolbar">
        {/* Source */}
        {btn(showSource, toggleSource, <Code size={15} />, "HTML Source")}
        {sep()}

        {/* Undo / Redo */}
        {btn(
          false,
          () => editor.chain().focus().undo().run(),
          <Undo2 size={15} />,
          "Undo",
        )}
        {btn(
          false,
          () => editor.chain().focus().redo().run(),
          <Redo2 size={15} />,
          "Redo",
        )}
        {sep()}

        {/* Heading dropdown */}
        <select
          className="rte-select"
          value={
            editor.isActive("heading", { level: 1 })
              ? 1
              : editor.isActive("heading", { level: 2 })
                ? 2
                : editor.isActive("heading", { level: 3 })
                  ? 3
                  : editor.isActive("heading", { level: 4 })
                    ? 4
                    : 0
          }
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: val }).run();
          }}
        >
          <option value={0}>Normal</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
          <option value={4}>Heading 4</option>
        </select>
        {sep()}

        <select
          className="rte-select"
          aria-label="Line spacing"
          title="Line spacing for the current paragraph"
          defaultValue="1.5"
          onChange={(e) => {
            const lineHeight = e.target.value;
            editor
              .chain()
              .focus()
              .updateAttributes("paragraph", { lineHeight: lineHeight || null })
              .run();
          }}
        >
          <option value="1">Line spacing: 1.0</option>
          <option value="1.15">Line spacing: 1.15</option>
          <option value="1.5">Line spacing: 1.5</option>
          <option value="1.75">Line spacing: 1.75</option>
          <option value="2">Line spacing: 2.0</option>
        </select>
        {sep()}

        {/* Article image and quotation */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => insertArticleImage(event.target.files?.[0])}
        />
        {btn(
          false,
          () => imageInputRef.current?.click(),
          <ImagePlus size={15} />,
          imageUploading ? "Uploading image…" : "Insert inline image",
        )}
        {editor.isActive("image") &&
          btn(
            false,
            () => editor.chain().focus().deleteSelection().run(),
            <Trash2 size={15} />,
            "Remove selected image",
          )}
        {btn(
          editor.isActive("blockquote"),
          () => editor.chain().focus().toggleBlockquote().run(),
          <Quote size={15} />,
          "Blockquote",
        )}
        {sep()}

        {/* Text formatting */}
        {btn(
          editor.isActive("bold"),
          () => editor.chain().focus().toggleBold().run(),
          <Bold size={15} />,
          "Bold",
        )}
        {btn(
          editor.isActive("italic"),
          () => editor.chain().focus().toggleItalic().run(),
          <Italic size={15} />,
          "Italic",
        )}
        {btn(
          editor.isActive("underline"),
          () => editor.chain().focus().toggleUnderline().run(),
          <UnderlineIcon size={15} />,
          "Underline",
        )}
        {btn(
          editor.isActive("strike"),
          () => editor.chain().focus().toggleStrike().run(),
          <Strikethrough size={15} />,
          "Strikethrough",
        )}
        {btn(
          editor.isActive("subscript"),
          () => editor.chain().focus().toggleSubscript().run(),
          <SubscriptIcon size={15} />,
          "Subscript",
        )}
        {btn(
          editor.isActive("superscript"),
          () => editor.chain().focus().toggleSuperscript().run(),
          <SuperscriptIcon size={15} />,
          "Superscript",
        )}
        {sep()}

        {/* Link */}
        {btn(
          editor.isActive("link"),
          () => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = prompt("Enter URL:");
              if (url) {
                if (!editor.state.selection.empty) {
                  editor.chain().focus().setLink({ href: url }).run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "text",
                      marks: [{ type: "link", attrs: { href: url } }],
                      text: url,
                    })
                    .run();
                }
              }
            }
          },
          <LinkIcon size={15} />,
          "Link",
        )}
        {sep()}

        {/* Font color */}
        <div className="rte-color-wrap" ref={colorRef}>
          <button
            type="button"
            className="rte-btn rte-color-btn"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Font Color"
          >
            <Palette
              size={15}
              style={{
                color: editor.getAttributes("textStyle").color || "#374151",
              }}
            />
          </button>
          {showColorPicker && (
            <div className="rte-color-dropdown">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="rte-color-swatch"
                  style={{ background: c }}
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowColorPicker(false);
                  }}
                />
              ))}
              <button
                type="button"
                className="rte-color-reset"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
              >
                Reset Color
              </button>
            </div>
          )}
        </div>

        {/* Background highlight color */}
        <div className="rte-color-wrap" ref={bgColorRef}>
          <button
            type="button"
            className="rte-btn rte-color-btn"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            title="Highlight Color"
          >
            <Highlighter
              size={15}
              style={{
                color: editor.getAttributes("highlight").color || "#374151",
              }}
            />
          </button>
          {showBgColorPicker && (
            <div className="rte-color-dropdown">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="rte-color-swatch"
                  style={{ background: c }}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                    setShowBgColorPicker(false);
                  }}
                />
              ))}
              <button
                type="button"
                className="rte-color-reset"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowBgColorPicker(false);
                }}
              >
                Reset Highlight
              </button>
            </div>
          )}
        </div>
        {sep()}

        {/* Alignment */}
        {btn(
          editor.isActive({ textAlign: "left" }),
          () => editor.chain().focus().setTextAlign("left").run(),
          <AlignLeft size={15} />,
          "Align Left",
        )}
        {btn(
          editor.isActive({ textAlign: "center" }),
          () => editor.chain().focus().setTextAlign("center").run(),
          <AlignCenter size={15} />,
          "Align Center",
        )}
        {btn(
          editor.isActive({ textAlign: "right" }),
          () => editor.chain().focus().setTextAlign("right").run(),
          <AlignRight size={15} />,
          "Align Right",
        )}
        {btn(
          editor.isActive({ textAlign: "justify" }),
          () => editor.chain().focus().setTextAlign("justify").run(),
          <AlignJustify size={15} />,
          "Justify",
        )}
        {sep()}

        {/* Lists */}
        {btn(
          editor.isActive("bulletList"),
          () => editor.chain().focus().toggleBulletList().run(),
          <List size={15} />,
          "Bullet List",
        )}
        {btn(
          editor.isActive("orderedList"),
          () => editor.chain().focus().toggleOrderedList().run(),
          <ListOrdered size={15} />,
          "Numbered List",
        )}
        {sep()}

        {/* Remove formatting */}
        {btn(
          false,
          () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
          <RemoveFormatting size={15} />,
          "Clear Formatting",
        )}
        {sep()}

        {/* Font family */}
        <select
          className="rte-select rte-select--font"
          value={editor.getAttributes("textStyle").fontFamily || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val) editor.chain().focus().setFontFamily(val).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
        >
          <option value="">Default Font</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
        </select>
        {sep()}

        {/* Table */}
        {btn(
          false,
          () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
          <TableIcon size={15} />,
          "Insert Table",
        )}
        {editor.isActive("table") && (
          <>
            {btn(
              false,
              () => editor.chain().focus().addColumnBefore().run(),
              <BetweenHorizontalStart size={15} />,
              "Add Column Before",
            )}
            {btn(
              false,
              () => editor.chain().focus().addColumnAfter().run(),
              <BetweenHorizontalEnd size={15} />,
              "Add Column After",
            )}
            {btn(
              false,
              () => editor.chain().focus().addRowBefore().run(),
              <BetweenVerticalStart size={15} />,
              "Add Row Before",
            )}
            {btn(
              false,
              () => editor.chain().focus().addRowAfter().run(),
              <BetweenVerticalEnd size={15} />,
              "Add Row After",
            )}
            {btn(
              false,
              () => editor.chain().focus().deleteColumn().run(),
              <TableColumnsSplit size={15} className="text-red-500" />,
              "Delete Column",
            )}
            {btn(
              false,
              () => editor.chain().focus().deleteRow().run(),
              <TableRowsSplit size={15} className="text-red-500" />,
              "Delete Row",
            )}
            {btn(
              false,
              () => editor.chain().focus().deleteTable().run(),
              <Trash2 size={15} className="text-red-500" />,
              "Delete Table",
            )}
          </>
        )}
        {sep()}

        {/* Indent / Outdent */}
        {btn(
          false,
          () => editor.chain().focus().sinkListItem("listItem").run(),
          <Indent size={15} />,
          "Indent",
        )}
        {btn(
          false,
          () => editor.chain().focus().liftListItem("listItem").run(),
          <Outdent size={15} />,
          "Outdent",
        )}

        {showSource && (
          <div className="rte-source-overlay">
            <textarea
              className="rte-source-textarea"
              value={sourceHtml}
              onChange={(e) => setSourceHtml(e.target.value)}
            />
          </div>
        )}
      </div>
      {imageDialogOpen && (
        <div
          className="rte-image-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !imageUploading)
              closeImageDialog();
          }}
        >
          <section
            className="rte-image-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rte-image-dialog-title"
          >
            <div className="rte-image-dialog-header">
              <div>
                <h3 id="rte-image-dialog-title">Insert article image</h3>
                <p>Add an optional caption and photo/source credit.</p>
              </div>
              <button
                type="button"
                className="rte-image-dialog-close"
                onClick={closeImageDialog}
                disabled={imageUploading}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            {pendingImage?.previewUrl && (
              <img
                className="rte-image-dialog-preview"
                src={pendingImage.previewUrl}
                alt="Image preview"
              />
            )}
            <label className="rte-image-dialog-field">
              <span>
                Caption <small>Optional</small>
              </span>
              <input
                value={imageCaption}
                onChange={(event) => setImageCaption(event.target.value)}
                placeholder="Describe this photograph"
                maxLength={300}
              />
            </label>
            <label className="rte-image-dialog-field">
              <span>
                Photographer / source credit <small>Optional</small>
              </span>
              <input
                value={imageCredit}
                onChange={(event) => setImageCredit(event.target.value)}
                placeholder="e.g. Photo: NAO / Name"
                maxLength={200}
              />
            </label>
            {imageError && (
              <p className="rte-image-dialog-error" role="alert">
                {imageError}
              </p>
            )}
            <div className="rte-image-dialog-actions">
              <button
                type="button"
                className="rte-image-dialog-cancel"
                onClick={closeImageDialog}
                disabled={imageUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rte-image-dialog-submit"
                onClick={uploadAndInsertImage}
                disabled={!pendingImage || imageUploading}
              >
                {imageUploading ? "Uploading…" : "Upload and insert image"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */
const CommonRichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing your content...",
}) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: false,
        paragraph: false,
      }),
      ParagraphLineHeight,
      Underline,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      ArticleImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Subscript,
      Superscript,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => onChangeRef.current?.(ed.getHTML()),
  });

  const prevValue = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value === prevValue.current) return;
    prevValue.current = value;
    if (value === editor.getHTML()) return;
    editor.commands.setContent(value || "", false, {
      preserveWhitespace: "full",
    });
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rte-container">
        <div className="rte-toolbar" />
        <div className="rte-content" style={{ minHeight: 160 }} />
      </div>
    );
  }

  return (
    <div className="rte-container">
      <CommonToolbar editor={editor} />
      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
};

export default CommonRichTextEditor;
