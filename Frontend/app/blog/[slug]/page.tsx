import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ImageReveal from "@/components/ImageReveal";
import ReadingProgress from "@/components/ReadingProgress";
import BlogCard from "@/components/BlogCard";
import { postApi } from "@/services/api";
import { APP_URL, formatDate } from "@/lib/utils";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await postApi.getPublished(params.slug).catch(() => null);
  if (!post) return { title: "Post not found" };
  const url = `${APP_URL}/blog/${post.slug}`;
  return {
    title: post.title, description: post.excerpt, alternates: { canonical: url },
    openGraph: { siteName: "Elucidaty", title: post.title, description: post.excerpt, url, type: "article", publishedTime: post.publishedAt ?? undefined, authors: [post.author], images: post.featuredImage ? [post.featuredImage] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await postApi.getPublished(params.slug);
  if (!post) notFound();
  const { related, prev, next } = await postApi.related(post.slug);

  return (
    <main className="wrap section">
      <ReadingProgress />
      <Link href="/blog" className="link">Back to Blog</Link>
      <article className="post">
        <header>
          <p className="meta">{post.category} · {post.readingTime} min read</p>
          <h1 className="h1">{post.title}</h1>
          <p className="meta">By {post.author} · <time dateTime={post.publishedAt || post.createdAt}>{formatDate(post.publishedAt || post.createdAt)}</time></p>
        </header>
        {post.featuredImage && <div className="post__img"><ImageReveal><Image src={post.featuredImage} alt={post.title} fill priority sizes="(max-width:900px) 100vw, 900px" /></ImageReveal></div>}
        <div className="prose">{post.content.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</div>
        {post.tags.length > 0 && <ul className="tags">{post.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
      </article>

      <nav className="pn" aria-label="More posts">
        {prev ? <Link href={`/blog/${prev.slug}`}><span className="meta">Previous</span><br />{prev.title}</Link> : <span />}
        {next ? <Link href={`/blog/${next.slug}`} className="pn__r"><span className="meta">Next</span><br />{next.title}</Link> : <span />}
      </nav>

      {related.length > 0 && (
        <section aria-labelledby="r"><h2 id="r" className="h2">Related posts</h2><div className="grid">{related.map((p, i) => <BlogCard key={p._id} post={p} index={i} />)}</div></section>
      )}
    </main>
  );
}
