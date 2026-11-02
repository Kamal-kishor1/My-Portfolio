import { apiFetch } from "./client";
import { API_PREFIX } from "./config";
import type { BlogPost, BlogPostInput, BlogPostSummary } from "@/types/blogPost";

// Matches routers/admin/blog_posts.py: prefix="/admin/blog-posts",
// list/create at "/", single item at "/{post_id}", updates are PATCH.
// List returns BlogPostListItem (thinner than the single-item response) —
// see getPost() below, used by the editor to fetch full content by id.
const BASE = `${API_PREFIX}/admin/blog-posts`;

export async function listPosts(): Promise<BlogPostSummary[]> {
  const res = await apiFetch(`${BASE}/`);
  if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
  return res.json();
}

export async function getPost(id: number): Promise<BlogPost> {
  const res = await apiFetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
  return res.json();
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const res = await apiFetch(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create post (${res.status})`);
  return res.json();
}

export async function updatePost(id: number, input: Partial<BlogPostInput>): Promise<BlogPost> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update post (${res.status})`);
  return res.json();
}

export async function deletePost(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete post (${res.status})`);
}
