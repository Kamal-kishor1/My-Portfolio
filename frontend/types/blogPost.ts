// List endpoint (GET /admin/blog-posts/) returns BlogPostListItem on the
// backend, which may be a thinner shape than BlogPostOut (single-item
// GET). If content isn't in the list response, BlogTab fetches the full
// post by id before opening the editor — see fetchPostForEdit below.

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string; // markdown
  cover_image_id: number | null;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  content: string;
  cover_image_id: number | null;
  published: boolean;
}

export const EMPTY_POST_INPUT: BlogPostInput = {
  title: "",
  slug: "",
  content: "",
  cover_image_id: null,
  published: false,
};
