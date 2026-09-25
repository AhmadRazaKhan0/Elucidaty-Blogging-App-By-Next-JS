"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BlogForm from "./BlogForm";
import { postApi, userMessage } from "@/services/api";
import { formatDate } from "@/lib/utils";
import type { IPost } from "@/types/post";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <motion.div data-lenis-prevent className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-label={title} className="modal" onMouseDown={(e) => e.stopPropagation()}
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}>
        <h2 className="h2">{title}</h2>{children}
      </motion.div>
    </motion.div>
  );
}

export default function AdminPanel() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<IPost | "new" | null>(null);
  const [deleting, setDeleting] = useState<IPost | null>(null);
  const [delBusy, setDelBusy] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setPosts((await postApi.list({ status: "all", limit: 50 })).posts); }
    catch (e) { setError(userMessage(e, "Unable to load posts. Please try again.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3000); return () => clearTimeout(t); }, [toast]);

  const shown = posts.filter((p) => (p.title + p.author + p.category).toLowerCase().includes(search.toLowerCase()));
  const published = posts.filter((p) => p.status === "published").length;

  async function confirmDelete() {
    if (!deleting || delBusy) return;
    setDelBusy(true);
    try { await postApi.remove(deleting._id); setToast("Post deleted"); setDeleting(null); await load(); }
    catch (e) { setToast(userMessage(e, "Failed to delete post. Please try again.")); }
    finally { setDelBusy(false); }
  }

  return (
    <main className="wrap section">
      <div className="admin__head">
        <div><h1 className="h1">Dashboard</h1><p className="muted">Manage your Elucidaty posts</p></div>
        <button className="btn" onClick={() => setEditing("new")}>Create post</button>
      </div>
      <dl className="stats">
        <div><dt>Total posts</dt><dd>{posts.length}</dd></div>
        <div><dt>Published</dt><dd>{published}</dd></div>
        <div><dt>Drafts</dt><dd>{posts.length - published}</dd></div>
      </dl>
      <label className="sr" htmlFor="as">Search posts</label>
      <input id="as" type="search" placeholder="Search by title, author or category" value={search} onChange={(e) => setSearch(e.target.value)} />

      {error && <div role="alert" className="notice notice--err"><p>{error}</p><button className="btn btn--ghost" onClick={load}>Try again</button></div>}
      {loading && <div className="skel" style={{ height: 180, marginTop: 16 }} aria-busy />}
      {!loading && !error && shown.length === 0 && <div className="notice"><p>{posts.length ? "No posts match your search." : "No posts yet. Create your first post."}</p></div>}

      {shown.length > 0 && (
        <div className="tablewrap">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Updated</th><th><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p._id}>
                  <td data-l="Title"><strong>{p.title}</strong><br /><small className="muted">{p.author}</small></td>
                  <td data-l="Category">{p.category}</td>
                  <td data-l="Status"><span className={`badge badge--${p.status}`}>{p.status}</span></td>
                  <td data-l="Updated">{formatDate(p.updatedAt)}</td>
                  <td className="acts">
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditing(p)} aria-label={`Edit ${p.title}`}>Edit</button>
                    <button className="btn btn--danger btn--sm" onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <Modal key="edit" title={editing === "new" ? "Create post" : "Edit post"} onClose={() => setEditing(null)}>
            <BlogForm post={editing === "new" ? undefined : editing} onCancel={() => setEditing(null)}
              onSaved={(_, m) => { setEditing(null); setToast(m); load(); }} />
          </Modal>
        )}
        {deleting && (
          <Modal key="del" title="Delete this post?" onClose={() => setDeleting(null)}>
            <p className="muted">“{deleting.title}” will be permanently removed. This can’t be undone.</p>
            <div className="row">
              <button className="btn btn--danger" onClick={confirmDelete} disabled={delBusy}>{delBusy ? "Deleting…" : "Delete post"}</button>
              <button className="btn btn--ghost" onClick={() => setDeleting(null)}>Cancel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div role="status" className="toast" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>{toast}</motion.div>}</AnimatePresence>
    </main>
  );
}
