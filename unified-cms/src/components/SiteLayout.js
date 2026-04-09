"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { SITES } from "@/lib/sites";
import { Icon } from "./common/Icon";
import { icons } from "@/lib/icons";

export default function SiteLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const siteId = params.siteId;
  const site = SITES[siteId];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accent = site.color;

  const activeModule = pathname.split("/").pop() || "blog";
  const router = useRouter();

  const switchSite = (id) => {
    router.push(`/${id}/blog`);
  };

  const handleCreateSite = async (e) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName: newSiteName, url: newSiteUrl }),
      });
      const data = await res.json();
      if (data.success) {
        // Option 1: Show success and reload page to reflect new site (simplest)
        alert("Site created! Please reload the page to see it in the list.");
        setShowAddSiteModal(false);
        setNewSiteName("");
        setNewSiteUrl("");
        // Option 2: If you later fetch sites dynamically, you'd update state here.
      } else {
        alert(data.message || "Failed to create site");
      }
    } catch (error) {
      console.error("Create site error", error);
      alert("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden relative"
      style={{ backgroundColor: "white" }}
    >
      {/* Sidebar - unchanged except for modal trigger inside dropdown */}
      <div
        className={`flex flex-col bg-light-sidebar border-r border-light-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Logo / Brand - unchanged */}
        <div
          className={`flex items-center gap-3 border-b border-light-border ${
            sidebarOpen ? "p-5" : "p-4 justify-center"
          }`}
        >
          <div
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors"
          >
            <Icon d={icons.menu} size={18} className="text-light-text-muted" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-light-text whitespace-nowrap">
                Unified CMS
              </div>
            </div>
          )}
        </div>

        {/* Site Switcher - unchanged except added modal trigger */}
        <div className={`${sidebarOpen ? "p-3" : "p-2"}`}>
          <div
            onClick={() => setSiteSwitcherOpen(!siteSwitcherOpen)}
            className={`flex items-center gap-2.5 rounded-lg border cursor-pointer transition-all ${
              sidebarOpen ? "px-3 py-2.5" : "px-2 py-2.5 justify-center"
            }`}
            style={{
              backgroundColor: `${accent}0C`,
              borderColor: `${accent}30`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white font-mono"
              style={{ backgroundColor: accent }}
            >
              {site.logo}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-light-text truncate">
                    {site.name}
                  </div>
                  <div className="text-[10px] text-light-text-muted truncate">
                    {site.domain}
                  </div>
                </div>
                <Icon
                  d={icons.chevDown}
                  size={16}
                  className="text-light-text-muted"
                />
              </>
            )}
          </div>

          {/* Site Dropdown - unchanged except the button opens modal */}
          {siteSwitcherOpen && (
            <>
              <div
                className="absolute z-50 w-60 bg-white border border-light-border rounded-xl p-1.5 shadow-xl flex flex-col"
                style={{
                  left: sidebarOpen ? 14 : 68,
                  top: sidebarOpen ? 135 : 110,
                }}
              >
                {Object.values(SITES).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => switchSite(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      s.id === siteId ? "bg-black/5" : "hover:bg-black/5"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white font-mono"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.logo}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-light-text">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-light-text-muted">
                        {s.domain}
                      </div>
                    </div>
                    {s.id === siteId && (
                      <Icon d={icons.check} size={14} color={s.color} />
                    )}
                  </div>
                ))}

                {/* This button now opens the modal instead of doing nothing */}
                <button
                  onClick={() => {
                    setSiteSwitcherOpen(false);
                    setShowAddSiteModal(true);
                  }}
                  className="bg-black/80 text-white rounded my-3 py-1 px-3 text-sm self-center cursor-pointer"
                >
                  + Add Site
                </button>
              </div>
              <div
                onClick={() => setSiteSwitcherOpen(false)}
                className="fixed inset-0 z-40"
              />
            </>
          )}
        </div>

        {/* Navigation - unchanged */}
        <nav
          className={`flex-1 overflow-y-auto ${sidebarOpen ? "px-3" : "px-2"}`}
        >
          {site.modules.map((mod, i) => {
            const isActive = activeModule === mod.id;
            const isSep = mod.id === "settings" && i > 0;
            return (
              <div key={mod.id}>
                {isSep && <div className="h-px bg-light-border my-2" />}
                <Link
                  href={`/${siteId}/${mod.id}`}
                  className={`flex items-center gap-2.5 rounded-lg transition-colors mb-0.5 ${
                    sidebarOpen ? "px-3 py-2" : "px-0 py-2 justify-center"
                  } ${isActive ? "bg-black/10" : "hover:bg-black/5"}`}
                  style={{ color: isActive ? accent : undefined }}
                >
                  <Icon d={icons[mod.icon]} size={18} />
                  {sidebarOpen && (
                    <span
                      className={`text-sm ${isActive ? "font-semibold" : "font-normal"}`}
                    >
                      {mod.label}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer - unchanged */}
        {sidebarOpen && (
          <div className="border-t border-light-border p-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
              <Icon
                d={icons.users}
                size={14}
                className="text-light-text-muted"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-light-text">Admin</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - unchanged */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - unchanged */}
        <div className="h-14 flex items-center justify-between px-7 border-b border-light-border bg-white/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: accent }}
            />
            <span className="text-sm font-semibold text-light-text">
              {site.name}
            </span>
            <span className="text-light-text-muted">/</span>
            <span className="text-sm text-light-text-muted">
              {site.modules.find((m) => m.id === activeModule)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={`https://${site.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-black/5 border border-light-border rounded-lg px-3 py-1.5 text-xs text-light-text-muted hover:text-[var(--accent)] hover:bg-black/10 transition-colors"
              style={{ "--accent": accent }}
            >
              <Icon d={icons.external} size={14} /> View Site
            </a>
          </div>
        </div>

        {/* Content Area - unchanged */}
        <div className="flex-1 overflow-y-auto p-7">
          <div className="">{children}</div>
        </div>
      </div>

      {/* ✅ ADD SITE MODAL - new code */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">Create New Site</h2>
            <form onSubmit={handleCreateSite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., My Blog"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Site"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setShowAddSiteModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
