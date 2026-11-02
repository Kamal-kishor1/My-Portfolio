"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProjectsTab } from "./projects/ProjectsTab";
import { BlogTab } from "./blog/BlogTab";
import { ResumeTab } from "./resume/ResumeTab";
import { MediaTab } from "./media/MediaTab";
import { MessagesTab } from "./messages/MessagesTab";
import { SeoMetaTab } from "./seo/SeoMetaTab";
import { HomepagePhotoTab } from "./profile/HomepagePhotoTab";
import { OverviewTab, type TabId } from "./overview/OverviewTab";
import { ThemeToggle } from "../ThemeToggle";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "projects", label: "PROJECTS" },
  { id: "blog", label: "BLOG" },
  { id: "resume", label: "RESUME" },
  { id: "timeline", label: "TIMELINE" },
  { id: "skills", label: "SKILLS" },
  { id: "profile", label: "HOME PHOTO" },
  { id: "media", label: "MEDIA" },
  { id: "messages", label: "MESSAGES" },
  { id: "seo", label: "SEO META" },
];

const TAB_CONTENT: Partial<Record<TabId, React.ComponentType>> = {
  projects: ProjectsTab,
  blog: BlogTab,
  resume: ResumeTab,
  timeline: () => <ResumeTab entryTypes={["experience"]} title="EXPERIENCE TIMELINE" />,
  skills: () => <ResumeTab entryTypes={["skill"]} title="SKILLS" />,
  profile: HomepagePhotoTab,
  media: MediaTab,
  messages: MessagesTab,
  seo: SeoMetaTab,
};

export function AdminShell() {
  const [active, setActive] = useState<TabId>("overview");
  const { user, logout } = useAuth();
  const ActiveTab = TAB_CONTENT[active];

  return (
    <div className="admin-root min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[var(--admin-accent)] shadow-[0_0_6px_var(--admin-accent)]" />
          <span className="font-mono text-xs tracking-[0.2em] text-[var(--admin-text-muted)]">
            ADMIN / SESSION ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="hidden text-[var(--admin-text-muted)] sm:inline">
            {user?.email} · <span className="text-[var(--admin-text)]">{user?.role}</span>
          </span>
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="rounded border border-[var(--admin-border-strong)] px-3 py-1.5 text-[var(--admin-text)] transition-colors hover:border-[var(--admin-danger)] hover:text-[var(--admin-danger)]"
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* Tabs — horizontally scrollable on narrow viewports rather than wrapping/squeezing */}
      <nav
        className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[var(--admin-border)] px-4 pt-2 sm:px-6 no-scrollbar"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              "relative shrink-0 whitespace-nowrap px-4 py-2.5 font-mono text-xs tracking-[0.12em] transition-colors",
              active === tab.id
                ? "text-[var(--admin-accent)]"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]",
            ].join(" ")}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-px bg-[var(--admin-accent)]" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        {active === "overview" ? (
          <OverviewTab onNavigate={setActive} />
        ) : ActiveTab ? (
          <ActiveTab />
        ) : null}
      </main>
    </div>
  );
}

