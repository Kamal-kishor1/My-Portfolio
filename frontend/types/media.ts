export interface MediaItem {
  id: number;
  filename: string;
  url: string;
  alt_text: string | null;
  content_type?: string | null;
  uploaded_by: number | null;
  created_at: string;
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"];
export function looksLikeImage(item: MediaItem): boolean {
  if (item.content_type) return item.content_type.startsWith("image/");
  const target = (item.url || item.filename).toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => target.endsWith(ext));
}
