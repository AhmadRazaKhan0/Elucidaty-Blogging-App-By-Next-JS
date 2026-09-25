"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import BlogCard from "./BlogCard";
import { postApi, userMessage } from "@/services/api";
import { CATEGORIES } from "@/lib/utils";
import type { IPost } from "@/types/post";

export default function BlogGrid() {
  const sp = useSearchParams();
  const [category, setCategory] = useState(sp.get("category") || "all");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const req = useRef(0);

  useEffect(() => { setCategory(sp.get("category") || "all"); }, [sp]);
  useEffect(() => { const t = setTimeout(() => setQ(search), 300); return () => clearTimeout(t); }, [search]);

  const load = useCallback(async (p: number, replace: boolean) => {
    const id = ++req.current;
    setLoading(true); setError("");
    try {
      const d = await postApi.list({ search: q, category, page: p, limit: 9 });
      if (id !== req.current) return;
      setPosts((prev) => (replace ? d.posts : [...prev, ...d.posts]));
      setPage(d.page); setPages(d.pages);
    } catch (e) {
      if (id === req.current) setError(userMessage(e, "Unable to load posts. Please try again."));
    } finally {
      if (id === req.current) setLoading(false);
    }
  }, [q, category]);

  useEffect(() => { load(1, true); }, [load]);

  return (
    <>
      <div className="filters">
        <label className="sr" htmlFor="s">Search posts</label>
        <input id="s" type="search" placeholder="Search posts" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="chips" role="group" aria-label="Categories">
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} aria-pressed={category === c} className={category === c ? "chip is-on" : "chip"} onClick={() => setCategory(c)}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="notice notice--err">
          <p>{error}</p><button className="btn btn--ghost" onClick={() => load(1, true)}>Try again</button>
        </div>
      )}

      {!error && posts.length === 0 && !loading && (
        <div className="notice"><p>No posts match your search{category !== "all" ? ` in ${category}` : ""}. Try a different keyword or category.</p></div>
      )}

      <div className="grid" aria-busy={loading}>
        {posts.map((p, i) => <BlogCard key={p._id} post={p} index={i} />)}
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skel" aria-hidden />)}
      </div>

      {!loading && page < pages && (
        <div className="center"><button className="btn" onClick={() => load(page + 1, false)}>Load more</button></div>
      )}
    </>
  );
}
