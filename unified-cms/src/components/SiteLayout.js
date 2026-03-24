// src/components/SiteLayout.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
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
  const accent = site.color;

  const activeModule = pathname.split("/").pop() || "dashboard";

  const switchSite = (id) => {
    window.location.href = `/${id}/dashboard`;
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden relative"
      style={{ backgroundColor: "white" }}
    >
      {/* Sidebar */}
      <div
        className={`flex flex-col bg-light-sidebar border-r border-light-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Logo / Brand */}
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

        {/* Site Switcher */}
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

          {/* Site Dropdown */}
          {siteSwitcherOpen && (
            <div
              className="absolute z-50 w-60 bg-white border border-light-border rounded-xl p-1.5 shadow-xl"
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
            </div>
          )}
        </div>

        {/* Navigation */}
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

        {/* Footer */}
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
              <div className="text-[10px] text-light-text-muted">
                admin@aeontrix.ai
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
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
            {/* <div className="flex items-center gap-2 bg-black/5 border border-light-border rounded-lg px-3 py-1.5">
              <Icon
                d={icons.search}
                size={14}
                className="text-light-text-muted"
              />
              <span className="text-xs text-light-text-muted">Search...</span>
              <span className="text-[10px] text-light-text-dim bg-black/5 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </span>
            </div> */}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-7">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </div>

      {/* Click-away for dropdown */}
      {siteSwitcherOpen && (
        <div
          onClick={() => setSiteSwitcherOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
}
