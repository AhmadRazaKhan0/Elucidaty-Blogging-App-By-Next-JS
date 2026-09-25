import { isValidObjectId } from "mongoose";
import Post, { IPost } from "../models/Post";
import { ApiError } from "../utils/ApiError";
import { PostInput, validatePost } from "../utils/validate";

const plain = <T,>(d: unknown): T => JSON.parse(JSON.stringify(d));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface ListParams { search?: string; category?: string; status?: string; page?: number; limit?: number }

export async function listPosts({ search, category, status = "published", page = 1, limit = 9 }: ListParams = {}) {
  const q: Record<string, unknown> = {};
  if (status !== "all") q.status = status;
  if (category && category !== "all") q.category = new RegExp(`^${esc(category)}$`, "i");
  if (search?.trim()) {
    const r = new RegExp(esc(search.trim()), "i");
    q.$or = [{ title: r }, { excerpt: r }, { content: r }, { tags: r }, { author: r }];
  }
  const p = Math.max(1, page), l = Math.min(50, Math.max(1, limit));
  const [items, total] = await Promise.all([
    Post.find(q).sort({ publishedAt: -1, createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
    Post.countDocuments(q),
  ]);
  return { posts: plain<IPost[]>(items), total, page: p, pages: Math.ceil(total / l) };
}

export async function getPost(idOrSlug: string, opts: { publishedOnly?: boolean } = {}) {
  const q: Record<string, unknown> = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };
  if (opts.publishedOnly) q.status = "published";
  const doc = await Post.findOne(q).lean();
  return doc ? plain<IPost>(doc) : null;
}

export async function getRelated(post: IPost) {
  const base = { status: "published", _id: { $ne: post._id } };
  const date = post.publishedAt || post.createdAt;
  const [related, prev, next] = await Promise.all([
    Post.find({ ...base, category: post.category }).sort({ publishedAt: -1 }).limit(3).lean(),
    Post.findOne({ ...base, publishedAt: { $lt: date } }).sort({ publishedAt: -1 }).select("title slug").lean(),
    Post.findOne({ ...base, publishedAt: { $gt: date } }).sort({ publishedAt: 1 }).select("title slug").lean(),
  ]);
  return { related: plain<IPost[]>(related), prev: prev ? plain<IPost>(prev) : null, next: next ? plain<IPost>(next) : null };
}

export async function createPost(body: PostInput) {
  const data = validatePost(body);
  if (data.status === "published") data.publishedAt = new Date();
  return plain<IPost>(await Post.create(data));
}

export async function updatePost(id: string, body: PostInput) {
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid post id");
  const data = validatePost(body, true);
  const existing = await Post.findById(id);
  if (!existing) throw new ApiError(404, "Post not found");
  if (data.status === "published" && !existing.publishedAt) data.publishedAt = new Date();
  if (data.status === "draft") data.publishedAt = null;
  existing.set(data);
  await existing.save();
  return plain<IPost>(existing);
}

export async function deletePost(id: string) {
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid post id");
  const doc = await Post.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "Post not found");
}
