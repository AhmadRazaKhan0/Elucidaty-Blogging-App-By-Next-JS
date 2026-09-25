import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as posts from "../services/postService";

const idOf = (v: unknown) => String(v);

export const list = asyncHandler(async (req, res) => {
  const q = req.query;
  const data = await posts.listPosts({
    search: q.search ? String(q.search) : undefined,
    category: q.category ? String(q.category) : undefined,
    status: q.status ? String(q.status) : "published",
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 9,
  });
  res.json({ success: true, data, message: "Posts fetched" });
});

export const getOne = asyncHandler(async (req, res) => {
  const post = await posts.getPost(idOf(req.params.id), { publishedOnly: req.query.publishedOnly === "true" });
  if (!post) throw new ApiError(404, "Post not found");
  res.json({ success: true, data: post, message: "Post fetched" });
});

export const related = asyncHandler(async (req, res) => {
  const post = await posts.getPost(idOf(req.params.id), { publishedOnly: true });
  if (!post) throw new ApiError(404, "Post not found");
  res.json({ success: true, data: await posts.getRelated(post), message: "Related posts fetched" });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await posts.createPost(req.body ?? {}), message: "Post created successfully" });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await posts.updatePost(idOf(req.params.id), req.body ?? {}), message: "Post updated successfully" });
});

export const remove = asyncHandler(async (req, res) => {
  await posts.deletePost(idOf(req.params.id));
  res.json({ success: true, data: null, message: "Post deleted successfully" });
});
