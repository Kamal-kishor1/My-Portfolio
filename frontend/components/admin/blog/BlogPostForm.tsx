"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlogPost, BlogPostInput } from "@/types/blogPost";
import { EMPTY_POST_INPUT } from "@/types/blogPost";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type ViewMode = "edit" | "split" | "preview";

export function BlogPostForm({
  post,
  onSave,
  onCancel,
}: {
  post: BlogPost | null; // null = creating new. Must be the FULL post (with content), not a list summary.
  onSave: (input: BlogPostInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [prevPost, setPrevPost] = useState(post);
  const [input, setInput] = useState<BlogPostInput>(() =>
    post
      ? {
          title: post.title,
          slug: post.slug,
          content: post.content,
          cover_image_id: post.cover_image_id,
          published: post.published,
        }
      : EMPTY_POST_INPUT
  );
  const [slugTouched, setSlugTouched] = useState(() => Boolean(post));
  const [view, setView] = useState<ViewMode>("split");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (post !== prevPost) {
    setPrevPost(post);
    setInput(
      post
        ? {
            title: post.title,
            slug: post.slug,
            content: post.content,
            cover_image_id: post.cover_image_id,
            published: post.published,
          }
        : EMPTY_POST_INPUT
    );
    setSlugTouched(Boolean(post));
  }

  function set<K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugTouched) set("slug", slugify(title));
  }

  async function handleSubmit(published?: boolean) {
    setError(null);
    setSaving(true);
    try {
      await onSave(published === undefined ? input : { ...input, published });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--admin-bg)]">
      <div className="border-b border-[var(--admin-border)] px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-3">
            <input
              value={input.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title"
              autoFocus
              className="w-full bg-transparent font-mono text-lg text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-faint)]"
            />
            <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] tracking-[0.1em] text-[var(--admin-text-muted)]">
              <MiniField label="SLUG">
                <input
                  value={input.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  className="w-40 bg-transparent text-[var(--admin-text)] outline-none"
                />
              </MiniField>
              <MiniField label="COVER IMAGE ID">
                <input
                  value={input.cover_image_id === null ? "" : String(input.cover_image_id)}
                  onChange={(e) => set("cover_image_id", e.target.value ? Number(e.target.value) : null)}
                  placeholder="none"
                  className="w-16 bg-transparent text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-faint)]"
                />
              </MiniField>
              <MiniField label="STATUS">
                <span className={input.published ? "text-[var(--admin-accent)]" : "text-[var(--admin-text)]"}>
                  {input.published ? "published" : "draft"}
                </span>
              </MiniField>
            </div>
          </div>

          <button onClick={onCancel} className="font-mono text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
            ESC ✕
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-[var(--admin-border)] px-6 py-2">
        {(["edit", "split", "preview"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            className={`rounded px-3 py-1 font-mono text-[10px] tracking-[0.15em] ${
              view === mode ? "bg-[var(--admin-border)] text-[var(--admin-accent)]" : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
            }`}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {(view === "edit" || view === "split") && (
          <textarea
            value={input.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="Write in markdown…"
            className={`h-full resize-none overflow-y-auto bg-[var(--admin-bg)] p-6 font-mono text-sm leading-relaxed text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-faint)] ${
              view === "split" ? "w-1/2 border-r border-[var(--admin-border)]" : "w-full"
            }`}
          />
        )}
        {(view === "preview" || view === "split") && (
          <div className={`h-full overflow-y-auto p-6 ${view === "split" ? "w-1/2" : "w-full"}`}>
            <article className="prose-console max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {input.content || "*Nothing to preview yet.*"}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>

      <style>{`
        .prose-console { font-family: ui-monospace, "SF Mono", monospace; font-size: 0.875rem; line-height: 1.7; color: var(--admin-text); }
        .prose-console h1, .prose-console h2, .prose-console h3 { color: var(--admin-text); font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; letter-spacing: 0.02em; }
        .prose-console h1 { font-size: 1.4rem; }
        .prose-console h2 { font-size: 1.15rem; }
        .prose-console h3 { font-size: 1rem; }
        .prose-console p { margin: 0.75em 0; }
        .prose-console a { color: var(--admin-accent); text-decoration: underline; }
        .prose-console code { background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 3px; padding: 0.1em 0.4em; font-size: 0.85em; }
        .prose-console pre { background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 4px; padding: 1em; overflow-x: auto; }
        .prose-console pre code { background: none; border: none; padding: 0; }
        .prose-console blockquote { border-left: 2px solid var(--admin-accent); padding-left: 1em; color: var(--admin-text-muted); margin: 1em 0; }
        .prose-console ul, .prose-console ol { padding-left: 1.4em; margin: 0.75em 0; }
        .prose-console table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .prose-console th, .prose-console td { border: 1px solid var(--admin-border); padding: 0.4em 0.6em; text-align: left; }
        .prose-console th { color: var(--admin-text-muted); font-weight: 500; }
        .prose-console hr { border: none; border-top: 1px solid var(--admin-border); margin: 1.5em 0; }
      `}</style>

      <div className="flex items-center justify-between border-t border-[var(--admin-border)] px-6 py-3">
        {error ? (
          <p className="font-mono text-xs text-[var(--admin-danger)]">{error}</p>
        ) : (
          <span className="font-mono text-[10px] text-[var(--admin-text-faint)]">
            {input.content.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="rounded border border-[var(--admin-border-strong)] px-4 py-2 font-mono text-xs tracking-[0.1em] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          >
            CANCEL
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving || !input.title || !input.slug}
            className="rounded border border-[var(--admin-border-strong)] px-4 py-2 font-mono text-xs tracking-[0.1em] text-[var(--admin-text)] hover:border-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            SAVE DRAFT
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving || !input.title || !input.slug}
            className="rounded bg-[var(--admin-accent)] px-4 py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--admin-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "SAVING…" : "PUBLISH"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[var(--admin-text-faint)]">{label}</span>
      {children}
    </span>
  );
}

