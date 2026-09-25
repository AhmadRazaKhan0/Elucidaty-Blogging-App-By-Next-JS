"use client";
import { FormEvent, useState } from "react";
import { postApi, userMessage } from "@/services/api";
import { CATEGORIES, slugify } from "@/lib/utils";
import type { IPost } from "@/types/post";

export default function BlogForm({ post, onSaved, onCancel }: { post?: IPost; onSaved: (p: IPost, msg: string) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    title: post?.title ?? "", slug: post?.slug ?? "", excerpt: post?.excerpt ?? "", content: post?.content ?? "",
    featuredImage: post?.featuredImage ?? "", category: post?.category ?? CATEGORIES[0], author: post?.author ?? "",
    tags: post?.tags.join(", ") ?? "", status: post?.status ?? "draft",
  });
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f, v: string) =>
    setF((p) => ({ ...p, [k]: v, ...(k === "title" && !slugTouched ? { slug: slugify(v) } : {}) }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const saved = post ? await postApi.update(post._id, f as never) : await postApi.create(f as never);
      onSaved(saved, post ? "Post updated" : "Post created");
    } catch (err) {
      setError(userMessage(err, "Failed to save post. Please check your information and try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="form" aria-busy={busy}>
      {error && <p role="alert" className="notice notice--err">{error}</p>}
      <label>Title<input required minLength={3} maxLength={140} value={f.title} onChange={(e) => set("title", e.target.value)} /></label>
      <label>Slug<input required value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></label>
      <label>Excerpt <small>{f.excerpt.length}/300</small><textarea required minLength={10} maxLength={300} rows={2} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></label>
      <label>Content <small>Separate paragraphs with a blank line</small><textarea required minLength={20} rows={9} value={f.content} onChange={(e) => set("content", e.target.value)} /></label>
      <div className="form__row">
        <label>Author<input required minLength={2} maxLength={60} value={f.author} onChange={(e) => set("author", e.target.value)} /></label>
        <label>Category<select value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Status<select value={f.status} onChange={(e) => set("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></label>
      </div>
      <label>Featured image URL<input type="url" placeholder="https://…" value={f.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} /></label>
      <label>Tags <small>Comma separated, up to 8</small><input value={f.tags} onChange={(e) => set("tags", e.target.value)} /></label>
      <div className="row">
        <button className="btn" disabled={busy}>{busy ? "Saving…" : post ? "Save changes" : "Create post"}</button>
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
