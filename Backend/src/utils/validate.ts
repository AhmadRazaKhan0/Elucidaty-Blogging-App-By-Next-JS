import { ApiError } from "./ApiError";
import { CATEGORIES, slugify } from "./constants";
import type { IPost } from "../models/Post";

const clean = (s: unknown) => String(s ?? "").replace(/<[^>]*>/g, "").trim();

export type PostInput = Partial<Omit<IPost, "_id" | "tags">> & { tags?: string[] | string };

export function validatePost(body: PostInput, partial = false) {
  const out: Record<string, unknown> = {};
  const errors: string[] = [];
  const has = (k: keyof PostInput) => body[k] !== undefined;
  const need = (k: keyof PostInput) => !partial || has(k);

  if (need("title")) {
    const v = clean(body.title);
    v.length < 3 || v.length > 140 ? errors.push("Title must be 3–140 characters") : (out.title = v);
  }
  if (has("slug") || !partial) {
    const v = slugify(clean(body.slug) || clean(body.title));
    v ? (out.slug = v) : errors.push("Slug is required");
  }
  if (need("excerpt")) {
    const v = clean(body.excerpt);
    v.length < 10 || v.length > 300 ? errors.push("Excerpt must be 10–300 characters") : (out.excerpt = v);
  }
  if (need("content")) {
    const v = String(body.content ?? "").replace(/<[^>]*>/g, "").trim();
    v.length < 20 ? errors.push("Content must be at least 20 characters") : (out.content = v);
  }
  if (need("category")) {
    CATEGORIES.includes(body.category as never) ? (out.category = body.category) : errors.push("Choose a valid category");
  }
  if (need("author")) {
    const v = clean(body.author);
    v.length < 2 || v.length > 60 ? errors.push("Author must be 2–60 characters") : (out.author = v);
  }
  if (has("featuredImage")) {
    const v = clean(body.featuredImage);
    v && !/^https?:\/\/\S+$/i.test(v) ? errors.push("Featured image must be an http(s) URL") : (out.featuredImage = v);
  }
  if (has("tags")) {
    const arr = Array.isArray(body.tags) ? body.tags : String(body.tags).split(",");
    out.tags = [...new Set(arr.map(clean).filter(Boolean))].slice(0, 8);
  }
  if (has("status")) {
    ["draft", "published"].includes(body.status as string) ? (out.status = body.status) : errors.push("Invalid status");
  }
  if (errors.length) throw new ApiError(400, errors.join(". "));
  if (typeof out.content === "string") out.readingTime = Math.max(1, Math.ceil(out.content.split(/\s+/).length / 200));
  return out;
}

