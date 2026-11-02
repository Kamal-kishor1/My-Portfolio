import { apiFetch as requestApi } from "./api/client";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type Project = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  tech_stack: string[] | null;
  repo_url: string | null;
  live_url: string | null;
  cover_image_url: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
};

export type BlogPostListItem = {
  id: number;
  title: string;
  slug: string;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
};

export type BlogPost = BlogPostListItem & {
  content: string;
  updated_at: string;
};

export type ResumeEntry = {
  id: number;
  type: "experience" | "education" | "skill";
  title: string;
  organization: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
};

export type HomepagePhoto = {
  url: string;
  alt_text: string;
};

async function apiFetch<T>(path: string, revalidateSeconds = 60): Promise<T> {
  void revalidateSeconds;
  const res = await requestApi(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

export function getProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/api/projects/");
}

export function getBlogPosts(): Promise<BlogPostListItem[]> {
  return apiFetch<BlogPostListItem[]>("/api/blog-posts/");
}

export function getBlogPost(slug: string): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/api/blog-posts/${slug}`);
}

export function getResume(): Promise<ResumeEntry[]> {
  return apiFetch<ResumeEntry[]>("/api/resume/");
}

export function getHomepagePhoto(): Promise<HomepagePhoto | null> {
  return apiFetch<HomepagePhoto | null>("/api/site/homepage-photo");
}

export async function getHealth(): Promise<{ status: string; database?: string } | null> {
  try {
    const res = await requestApi(`${API_BASE}/health`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<{ status: string; id: number }> {
  const res = await requestApi(`${API_BASE}/api/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to send message");
  }
  return res.json();
}
