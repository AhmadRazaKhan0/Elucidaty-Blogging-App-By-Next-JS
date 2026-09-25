import type { IPost, PostInput, PostList, RelatedPosts } from "@/types/post";

// Single source of truth for the backend URL (change via NEXT_PUBLIC_API_URL).
// In production there is deliberately NO localhost fallback: a missing variable must fail loudly, not call the visitor's own machine.
const fallback = process.env.NODE_ENV === "production" ? "" : "http://localhost:5000";
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || fallback).replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Opts = RequestInit & { revalidate?: number };

async function request<T>(path: string, { revalidate, ...init }: Opts = {}): Promise<T> {
  if (!API_URL) throw new ApiRequestError(0, "NEXT_PUBLIC_API_URL is not configured.");
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json" },
      ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }),
    });
  } catch {
    throw new ApiRequestError(0, "Cannot reach the server. Check that the backend is running and try again.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new ApiRequestError(res.status, json?.message || `Request failed (${res.status})`);
  return json.data as T;
}

/** Message safe to show users: keep specific 400/409 (validation, duplicate slug) messages, hide everything else behind the fallback. */
export function userMessage(e: unknown, fallback: string) {
  return e instanceof ApiRequestError && [400, 409].includes(e.status) ? e.message : fallback;
}

export const postApi = {
  list: (p: Record<string, string | number | undefined> = {}, revalidate?: number) => {
    const qs = new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
    return request<PostList>(`/posts?${qs}`, { revalidate });
  },
  // Returns null on 404, throws on any other error.
  getPublished: async (slug: string, revalidate?: number) => {
    try { return await request<IPost>(`/posts/${encodeURIComponent(slug)}?publishedOnly=true`, { revalidate }); }
    catch (e) { if (e instanceof ApiRequestError && e.status === 404) return null; throw e; }
  },
  related: (slug: string, revalidate?: number) => request<RelatedPosts>(`/posts/${encodeURIComponent(slug)}/related`, { revalidate }),
  create: (b: PostInput) => request<IPost>("/posts", { method: "POST", body: JSON.stringify(b) }),
  update: (id: string, b: PostInput) => request<IPost>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(b) }),
  remove: (id: string) => request<null>(`/posts/${id}`, { method: "DELETE" }),
};
