export interface Project {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  tech_stack: string[] | null;
  repo_url: string | null;
  live_url: string | null;
  cover_image_id: number | null;
  cover_image_url: string | null; // server-computed from cover_image_id, read-only
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  tech_stack: string[] | null;
  repo_url: string | null;
  live_url: string | null;
  cover_image_id: number | null;
  featured: boolean;
  published: boolean;
}

export const EMPTY_PROJECT_INPUT: ProjectInput = {
  title: "",
  slug: "",
  summary: null,
  description: null,
  tech_stack: null,
  repo_url: null,
  live_url: null,
  cover_image_id: null,
  featured: false,
  published: false,
};
