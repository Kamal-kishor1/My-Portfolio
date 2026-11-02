"use client";

import { useEffect, useState } from "react";
import type { BlogPost, BlogPostInput, BlogPostSummary } from "@/types/blogPost";
import { createPost, deletePost, getPost, listPosts, updatePost } from "@/lib/api/blogPosts";
import { BlogPostForm } from "./BlogPostForm";
import { Skeleton } from "../Skeleton";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; post: BlogPost };

export function BlogTab() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [loadingEdit, setLoadingEdit] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPosts();
      setPosts(
        data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listPosts();
        if (cancelled) return;
        setPosts(
          data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load posts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // The list endpoint returns a thin summary (no `content`). Fetch the
  // full post by id before opening the editor, so we never save over
  // real content with an empty string.
  async function openEdit(summary: BlogPostSummary) {
    setLoadingEdit(summary.id);
    setError(null);
    try {
      const full = await getPost(summary.id);
      setForm({ mode: "edit", post: full });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post for editing.");
    } finally {
      setLoadingEdit(null);
    }
  }

  async function handleSave(input: BlogPostInput) {
    if (form.mode === "edit") {
      await updatePost(form.post.id, input);
    } else {
      await createPost(input);
    }
    setForm({ mode: "closed" });
    await refresh();
  }

  async function handleDelete(id: number) {
    try {
      await deletePost(id);
      setConfirmingDelete(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">BLOG POSTS ({posts.length})</h1>
        <button
          onClick={() => setForm({ mode: "create" })}
          className="rounded bg-[var(--admin-accent)] px-3 py-1.5 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--admin-bg)] hover:opacity-90"
        >
          + NEW POST
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-left text-[var(--admin-text-muted)]">
                <Th>TITLE</Th>
                <Th>STATUS</Th>
                <Th>UPDATED</Th>
                <Th className="text-right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-3"><Skeleton className="h-4 w-10" /><Skeleton className="h-4 w-12" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--admin-border)] font-mono text-xs text-[var(--admin-text-faint)]">
          <span>NO POSTS YET</span>
          <span>Click + NEW POST to write one</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-left text-[var(--admin-text-muted)]">
                <Th>TITLE</Th>
                <Th>STATUS</Th>
                <Th>UPDATED</Th>
                <Th className="text-right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3 text-[var(--admin-text)]">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={p.published ? "text-[var(--admin-accent)]" : "text-[var(--admin-text-muted)]"}>
                      {p.published ? "published" : "draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      disabled={loadingEdit === p.id}
                      className="mr-3 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-40"
                    >
                      {loadingEdit === p.id ? "LOADING…" : "EDIT"}
                    </button>
                    {confirmingDelete === p.id ? (
                      <button onClick={() => handleDelete(p.id)} className="text-[var(--admin-danger)]">
                        CONFIRM?
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(p.id)}
                        onBlur={() => setConfirmingDelete(null)}
                        className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                      >
                        DELETE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form.mode !== "closed" && (
        <BlogPostForm
          post={form.mode === "edit" ? form.post : null}
          onSave={handleSave}
          onCancel={() => setForm({ mode: "closed" })}
        />
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-normal tracking-[0.1em] ${className}`}>{children}</th>;
}
