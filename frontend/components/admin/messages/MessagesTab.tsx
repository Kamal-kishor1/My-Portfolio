"use client";

import { useEffect, useState } from "react";
import type { ContactMessage } from "@/types/contactMessage";
import { deleteMessage, listMessages, markMessageRead } from "@/lib/api/contactMessages";
import { Skeleton } from "../Skeleton";

export function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listMessages();
      setMessages(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listMessages();
        if (cancelled) return;
        setMessages(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleExpand(msg: ContactMessage) {
    const opening = expanded !== msg.id;
    setExpanded(opening ? msg.id : null);
    if (opening && !msg.is_read) {
      try {
        const updated = await markMessageRead(msg.id);
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
      } catch {
        // non-critical — don't block reading the message over this
      }
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMessage(id);
      setConfirmingDelete(null);
      if (expanded === id) setExpanded(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message.");
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">
          MESSAGES ({messages.length})
          {unreadCount > 0 && <span className="ml-2 text-[var(--admin-accent)]">{unreadCount} UNREAD</span>}
        </h1>
      </div>

      {error && (
        <p className="mb-4 rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="overflow-hidden rounded border border-[var(--admin-border)]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--admin-border)] font-mono text-xs text-[var(--admin-text-faint)]">
          <span>NO MESSAGES YET</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-[var(--admin-border)]">
          {messages.map((msg) => (
            <div key={msg.id} className="border-b border-[var(--admin-border)] last:border-0">
              <button
                onClick={() => toggleExpand(msg)}
                className="group flex w-full items-center justify-between px-4 py-3 text-left font-mono text-xs transition-colors hover:bg-[var(--admin-surface-hover)] focus:bg-[var(--admin-surface-hover)] focus:outline-none"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${msg.is_read ? "bg-transparent group-hover:bg-[var(--admin-border-strong)]" : "bg-[var(--admin-accent)]"}`} />
                  <span className={msg.is_read ? "text-[var(--admin-text-muted)] group-hover:text-[var(--admin-text)] transition-colors" : "text-[var(--admin-text)]"}>{msg.name}</span>
                  <span className="truncate text-[var(--admin-text-faint)] group-hover:text-[var(--admin-text-muted)] transition-colors">{msg.email}</span>
                </div>
                <span className="shrink-0 pl-3 text-[var(--admin-text-faint)]">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </button>

              {expanded === msg.id && (
                <div className="border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4">
                  <div className="mb-3 font-mono text-[10px] text-[var(--admin-text-muted)]">
                    FROM {msg.name} ·{" "}
                    <a href={`mailto:${msg.email}`} className="text-[var(--admin-accent)] underline">
                      {msg.email}
                    </a>
                  </div>
                  <p className="max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--admin-text)]">
                    {msg.message}
                  </p>
                  <div className="mt-4 flex items-center gap-4 border-t border-[var(--admin-border)] pt-3 font-mono text-[10px]">
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent("Re: your message")}`}
                      className="text-[var(--admin-accent)] hover:opacity-80"
                    >
                      REPLY
                    </a>
                    {confirmingDelete === msg.id ? (
                      <button onClick={() => handleDelete(msg.id)} className="text-[var(--admin-danger)]">
                        CONFIRM DELETE?
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(msg.id)}
                        onBlur={() => setConfirmingDelete(null)}
                        className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                      >
                        DELETE
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
