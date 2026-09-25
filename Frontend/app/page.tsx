import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import BlogCard from "@/components/BlogCard";
import { postApi } from "@/services/api";
import { APP_URL, CATEGORIES, formatDate } from "@/lib/utils";
import type { IPost } from "@/types/post";

export const dynamic = "force-dynamic"; // always fresh: new/edited posts show immediately
export const metadata: Metadata = {
  title: "Elucidaty — Clear writing on software, design and work",
  description: "Elucidaty is a publication for developers and designers who like to think out loud.",
  alternates: { canonical: APP_URL },
  openGraph: { title: "Elucidaty — Clear writing on software, design and work", description: "Elucidaty is a publication for developers and designers who like to think out loud.", url: APP_URL, siteName: "Elucidaty" },
};

export default async function Home() {
  let posts: IPost[] = [];
  let failed = false;
  try { posts = (await postApi.list({ limit: 7 })).posts; } catch { failed = true; }
  const [featured, ...latest] = posts;

  return (
    <main>
      <section className="wrap hero">
        <Reveal><h1 className="hero__title">Write it down.<br />Think it through.</h1></Reveal>
        <Reveal delay={0.08}><p className="lead muted">Elucidaty publishes long-form notes on software, design and the craft around them.</p></Reveal>
        <Reveal delay={0.16}><div className="row"><Link href="/blog" className="btn">Read the blog</Link><Link href="/admin" className="btn btn--ghost">Write a post</Link></div></Reveal>
      </section>

      <section className="wrap section" aria-labelledby="f">
        <h2 id="f" className="h2">Featured</h2>
        {failed && <div role="alert" className="notice notice--err"><p>Unable to load posts. Please try again in a moment.</p></div>}
        {!failed && !featured && <div className="notice"><p>No posts yet. <Link className="link" href="/admin">Publish the first one.</Link></p></div>}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="feat">
            <div className="feat__img">{featured.featuredImage ? <Image src={featured.featuredImage} alt="" fill priority sizes="(max-width:800px) 100vw, 55vw" /> : <span className="ph">{featured.category}</span>}</div>
            <div>
              <p className="meta">{featured.category} · {featured.readingTime} min read</p>
              <h3 className="feat__title">{featured.title}</h3>
              <p className="muted">{featured.excerpt}</p>
              <p className="meta">{featured.author} · {formatDate(featured.publishedAt || featured.createdAt)}</p>
            </div>
          </Link>
        )}
      </section>

      {latest.length > 0 && (
        <section className="wrap section" aria-labelledby="l">
          <h2 id="l" className="h2">Latest</h2>
          <div className="grid">{latest.map((p, i) => <BlogCard key={p._id} post={p} index={i} />)}</div>
        </section>
      )}

      <section className="wrap section" aria-labelledby="c">
        <h2 id="c" className="h2">Browse by topic</h2>
        <div className="chips">{CATEGORIES.map((c) => <Link key={c} className="chip" href={`/blog?category=${c}`}>{c}</Link>)}</div>
      </section>

      <section className="wrap section about">
        <h2 className="h2">About</h2>
        <p className="lead">Elucidaty is a small, independent publication. Every article is written by someone who builds things for a living, and edited for clarity over cleverness.</p>
      </section>

      <section className="wrap section cta">
        <h2 className="h2">Have something to say?</h2>
        <p className="muted">Draft in the editor, publish when it’s ready.</p>
        <Link href="/admin" className="btn">Start writing</Link>
      </section>
    </main>
  );
}
