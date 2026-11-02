"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listProjects } from "@/lib/api/projects";
import { listPosts } from "@/lib/api/blogPosts";
import { listResumeEntries } from "@/lib/api/resumeEntries";
import { listMessages } from "@/lib/api/contactMessages";
import { listMedia } from "@/lib/api/media";
import { listSeoMeta } from "@/lib/api/seoMeta";
import type { Project } from "@/types/project";
import type { BlogPostSummary } from "@/types/blogPost";
import type { ContactMessage } from "@/types/contactMessage";
import { StatusBadge } from "../StatusBadge";
import { HealthPanel } from "./HealthPanel";
import { Skeleton } from "../Skeleton";

import { Plus, FileText, Mail } from "lucide-react";

export type TabId = "overview" | "projects" | "blog" | "resume" | "timeline" | "skills" | "profile" | "media" | "messages" | "seo";

interface DashboardData {
  projects: Project[];
  posts: BlogPostSummary[];
  resumeCount: number;
  messages: ContactMessage[];
  mediaCount: number;
  seoCount: number;
}

interface ActivityItem {
  id: string;
  label: string;
  timestamp: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function OverviewTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // All figures below are derived client-side from the existing list
        // endpoints — there is no dedicated dashboard/stats endpoint on the
        // backend. Six calls on every Overview visit is acceptable for an
        // admin-only, low-traffic dashboard; revisit if this tab is hit
        // frequently and the lists grow large.
        const [projects, posts, resume, messages, media, seo] = await Promise.all([
          listProjects(),
          listPosts(),
          listResumeEntries(),
          listMessages(),
          listMedia(),
          listSeoMeta(),
        ]);
        if (cancelled) return;
        setData({
          projects,
          posts,
          resumeCount: resume.length,
          messages,
          mediaCount: media.length,
          seoCount: seo.length,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-10">
        <div>
          <Skeleton className="mb-1 h-4 w-24" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-8 w-12" />
              <Skeleton className="mt-2 h-2.5 w-24" />
            </div>
          ))}
        </div>

        {/* Quick actions & Health */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-[var(--admin-text-muted)]">QUICK ACTIONS</h2>
            <div className="grid h-[calc(100%-2rem)] grid-cols-1 gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col justify-between rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-2.5 w-32" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-full w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent projects */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-[10px] tracking-[0.2em] text-[var(--admin-text-muted)]">RECENT PROJECTS</h2>
            </div>
            <div className="overflow-hidden rounded border border-[var(--admin-border)]">
              <div className="flex flex-col">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[var(--admin-border-strong)] px-5 py-4 last:border-0">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-[var(--admin-text-muted)]">RECENT ACTIVITY</h2>
            <div className="overflow-hidden rounded border border-[var(--admin-border)]">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 border-b border-[var(--admin-border-strong)] px-5 py-4 last:border-0">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-4 py-3 font-mono text-xs text-[var(--admin-danger)]">
        {error ?? "Failed to load dashboard."}
      </p>
    );
  }

  const publishedProjects = data.projects.filter((p) => p.published).length;
  const draftProjects = data.projects.length - publishedProjects;
  const publishedPosts = data.posts.filter((p) => p.published).length;
  const draftPosts = data.posts.length - publishedPosts;
  const unreadMessages = data.messages.filter((m) => !m.is_read).length;

  const recentProjects = [...data.projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const activity: ActivityItem[] = [
    ...data.projects.map((p) => ({
      id: `project-${p.id}`,
      label: `Project "${p.title.trim()}" ${p.published ? "published" : "updated"}`,
      timestamp: p.updated_at,
    })),
    ...data.posts.map((p) => ({
      id: `post-${p.id}`,
      label: `Blog post "${p.title.trim()}" ${p.published ? "published" : "updated"}`,
      timestamp: p.updated_at,
    })),
    ...data.messages.map((m) => ({
      id: `message-${m.id}`,
      label: `New message from ${m.name.trim()}`,
      timestamp: m.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div>
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">DASHBOARD</h1>
        <p className="mt-1 font-mono text-xs text-[var(--admin-text-muted)]">
          {user?.email} · {user?.role}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="PROJECTS" value={data.projects.length} sub={`${publishedProjects} published · ${draftProjects} draft`} />
        <StatCard label="BLOG POSTS" value={data.posts.length} sub={`${publishedPosts} published · ${draftPosts} draft`} />
        <StatCard
          label="MESSAGES"
          value={data.messages.length}
          sub={unreadMessages > 0 ? `${unreadMessages} unread` : "all read"}
          highlight={unreadMessages > 0}
        />
        <StatCard label="MEDIA FILES" value={data.mediaCount} />
        <StatCard label="RESUME ENTRIES" value={data.resumeCount} />
      </div>

      {/* Lower Grid Structure: 3 columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Col 1: Quick Actions */}
        <div className="flex flex-col h-full">
          <h2 className="mb-3 font-mono text-[11px] font-bold tracking-[0.2em] text-[var(--admin-text)]">QUICK ACTIONS</h2>
          <div className="flex flex-1 flex-col gap-3">
            <QuickActionCard
              label="NEW PROJECT"
              description="Add a project to your portfolio"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => onNavigate("projects")}
            />
            <QuickActionCard
              label="NEW BLOG POST"
              description="Write a new post"
              icon={<FileText className="h-4 w-4" />}
              onClick={() => onNavigate("blog")}
            />
            <QuickActionCard
              label="VIEW MESSAGES"
              description={unreadMessages > 0 ? `${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}` : "No unread messages"}
              icon={<Mail className="h-4 w-4" />}
              onClick={() => onNavigate("messages")}
              badge={unreadMessages > 0 ? unreadMessages : undefined}
            />
          </div>
        </div>

        {/* Col 2: Recent Projects */}
        <div className="flex flex-col h-full">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[var(--admin-text)]">RECENT PROJECTS</h2>
            <button
              onClick={() => onNavigate("projects")}
              className="font-mono text-[10px] font-semibold text-[var(--admin-accent)] transition-opacity hover:opacity-80"
            >
              VIEW ALL →
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[var(--admin-surface)] shadow-sm">
            {recentProjects.length === 0 ? (
              <EmptyBlock label="No projects yet" />
            ) : (
              <div className="flex flex-col">
                {recentProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigate("projects")}
                    className="flex cursor-pointer items-center border-b border-white/[0.05] px-5 py-4 transition-all duration-200 last:border-0 hover:bg-white/[0.04] hover:border-zinc-700/50"
                  >
                    <div className="flex-1 min-w-0 truncate font-mono text-xs text-[var(--admin-text)]">
                      {p.title.trim()}
                    </div>
                    <div className="shrink-0 mx-4">
                      <StatusBadge tone={p.published ? "positive" : "neutral"} label={p.published ? "published" : "draft"} />
                    </div>
                    <div className="shrink-0 whitespace-nowrap min-w-[70px] text-right font-mono text-xs font-medium text-zinc-400">
                      {new Date(p.updated_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Recent Activity + Health */}
        <div className="flex flex-col gap-8 h-full">
          <div className="flex flex-1 flex-col">
            <h2 className="mb-3 font-mono text-[11px] font-bold tracking-[0.2em] text-[var(--admin-text)]">RECENT ACTIVITY</h2>
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[var(--admin-surface)] shadow-sm">
              {activity.length === 0 ? (
                <EmptyBlock label="No recent activity" />
              ) : (
                <div className="flex flex-col">
                  {activity.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-4 border-b border-white/[0.05] px-5 py-4 font-mono text-xs transition-colors duration-200 last:border-0 hover:bg-white/[0.04]"
                    >
                      <span className="truncate text-[var(--admin-text)]">{a.label}</span>
                      <span className="shrink-0 whitespace-nowrap font-medium text-zinc-300">
                        {timeAgo(a.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-3 font-mono text-[10px] text-zinc-500">
              Approximate — derived from recent update timestamps, not a real audit log.
            </p>
          </div>

          <div className="flex flex-col">
            <HealthPanel className="!border-white/[0.08] shadow-sm rounded-lg" />
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border p-6 shadow-sm transition-all duration-200 ${
        highlight 
          ? "border-[var(--admin-accent)]/40 bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/60" 
          : "border-white/[0.08] bg-[var(--admin-surface)] hover:border-white/[0.15]"
      }`}
    >
      <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[var(--admin-text)]/90">{label}</p>
      <p className="mt-3 font-mono text-3xl font-bold text-[var(--admin-text)]">{value}</p>
      {sub && <p className="mt-auto pt-4 font-mono text-[10px] font-medium text-zinc-400">{sub}</p>}
    </div>
  );
}

function QuickActionCard({
  label,
  description,
  onClick,
  badge,
  icon,
}: {
  label: string;
  description: string;
  onClick: () => void;
  badge?: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col items-start justify-center rounded-lg border border-white/[0.08] bg-[var(--admin-surface)] p-4 text-left shadow-sm transition-all duration-200 hover:border-[var(--admin-accent)]/50 hover:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
    >
      {badge !== undefined && (
        <span className="absolute right-3 top-3 rounded-full bg-[var(--admin-accent)] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[var(--admin-bg)]">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        {icon && <div className="text-[var(--admin-text-muted)] transition-colors group-hover:text-[var(--admin-accent)]">{icon}</div>}
        <div className="flex flex-col">
          <p className="font-mono text-xs font-bold tracking-[0.1em] text-[var(--admin-text)] transition-colors group-hover:text-[var(--admin-accent)]">
            {label}
          </p>
          <p className="mt-1 font-mono text-[10px] text-[var(--admin-text-muted)]">{description}</p>
        </div>
      </div>
    </button>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[120px] flex-1 items-center justify-center rounded border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] font-mono text-[10px] text-[var(--admin-text-faint)]">
      {label}
    </div>
  );
}
