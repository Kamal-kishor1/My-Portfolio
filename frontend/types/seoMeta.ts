export type SeoEntityType = "project" | "blog_post" | "site";

export interface SeoMeta {
  id: number;
  entity_type: SeoEntityType;
  entity_id: number | null; // null = site-wide defaults (only valid when entity_type === "site")
  title: string | null;
  description: string | null;
  og_image_id: number | null;
}

export interface SeoMetaInput {
  entity_type: SeoEntityType;
  entity_id: number | null;
  title: string | null;
  description: string | null;
  og_image_id: number | null;
}

export const EMPTY_SEO_INPUT: SeoMetaInput = {
  entity_type: "site",
  entity_id: null,
  title: null,
  description: null,
  og_image_id: null,
};
