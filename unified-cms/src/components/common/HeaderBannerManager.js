"use client";

import { useEffect, useState } from "react";

const emptyItem = () => ({
  text: "",
  actionText: "Check here →",
  url: "",
  enabled: true,
});

export function HeaderBannerManager({ siteId = "nao", accent = "#0E4DA4" }) {
  const [items, setItems] = useState([]);
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/${siteId}/header-banner`)
      .then((r) => r.json())
      .then((json) => {
        if (active && json.success) {
          setItems(json.data || []);
          setBannerEnabled(json.enabled !== false);
        }
      })
      .catch(() => {
        if (active) setMessage("Unable to load banner settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [siteId]);

  const update = (index, key, value) =>
    setItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/${siteId}/header-banner`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, enabled: bannerEnabled }),
      });
      const json = await response.json();
      if (!response.ok || !json.success)
        throw new Error(json.message || "Unable to save banner.");
      setItems(json.data || []);
      setBannerEnabled(json.enabled !== false);
      setMessage("Header banner settings saved successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const siteLabel = siteId.toUpperCase();
  if (loading)
    return (
      <div className="p-6 text-sm text-gray-500">Loading header banner…</div>
    );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {siteLabel} Header Banner
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage up to three announcements shown in the {siteLabel} website
          header. Each announcement has text and a separate clickable action
          link.
        </p>
      </div>

      <section className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-gray-800">Display header banner</h3>
          <p className="mt-1 text-sm text-gray-500">
            Turn this off to completely hide the banner and collapse its space
            on the website.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={bannerEnabled}
            onChange={(e) => setBannerEnabled(e.target.checked)}
          />
          {bannerEnabled ? "On" : "Off"}
        </label>
      </section>

      <div className="space-y-4">
        {items.map((item, index) => (
          <section
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Announcement {index + 1}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setItems((current) => current.filter((_, i) => i !== index))
                }
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Announcement text
            </label>
            <input
              maxLength={240}
              value={item.text}
              onChange={(e) => update(index, "text", e.target.value)}
              placeholder="e.g. Phase 1 Results are out"
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Action link text
            </label>
            <input
              maxLength={80}
              value={item.actionText || ""}
              onChange={(e) => update(index, "actionText", e.target.value)}
              placeholder="e.g. Check here →"
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Redirect URL
            </label>
            <input
              value={item.url}
              onChange={(e) => update(index, "url", e.target.value)}
              placeholder="https://example.com/results or /results"
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={item.enabled !== false}
                onChange={(e) => update(index, "enabled", e.target.checked)}
              />
              Display this announcement
            </label>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={items.length >= 3}
          onClick={() => setItems((current) => [...current, emptyItem()])}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add announcement ({items.length}/3)
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          style={{ backgroundColor: accent }}
          className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save banner"}
        </button>
      </div>
      {message && (
        <p role="status" className="text-sm text-gray-700">
          {message}
        </p>
      )}
    </div>
  );
}
