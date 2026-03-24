// src/components/sites/tbbt/TBBTDashboard.js
import { StatCard } from "../../common/StatCard";
import { SectionHeader } from "../../common/SectionHeader";
import { Badge } from "../../common/Badge";
import { MOCK } from "../../../lib/mockData";

export const TBBTDashboard = ({ accent }) => {
  const d = MOCK.tbbt;
  return (
    <>
      <div className="flex gap-3.5 flex-wrap mb-7">
        <StatCard
          label="Upcoming Events"
          value={d.events.filter((e) => e.status === "upcoming").length}
          accent={accent}
        />
        <StatCard
          label="Total Blog Posts"
          value={d.blog.length}
          accent={accent}
        />
        <StatCard
          label="Media Albums"
          value={d.gallery.length}
          accent={accent}
        />
        <StatCard
          label="Total Tickets Sold"
          value={d.events.reduce((a, e) => a + e.tickets, 0)}
          accent={accent}
        />
      </div>
      <SectionHeader title="Upcoming Events" accent={accent} />
      <div className="flex flex-col gap-2.5">
        {d.events
          .filter((e) => e.status === "upcoming")
          .map((ev) => (
            <div
              key={ev.id}
              className="bg-light-surface border border-light-border rounded-xl p-4 flex justify-between items-center flex-wrap gap-3"
            >
              <div>
                <div className="font-semibold text-light-text text-sm">
                  {ev.title}
                </div>
                <div className="text-light-text-muted text-xs mt-1">
                  {ev.venue} · {ev.date}
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <span className="font-mono text-sm" style={{ color: accent }}>
                  {ev.tickets}/{ev.capacity}
                </span>
                <Badge status={ev.status} />
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
