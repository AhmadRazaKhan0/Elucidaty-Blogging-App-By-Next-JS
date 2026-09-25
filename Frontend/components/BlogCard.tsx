"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { IPost } from "@/types/post";
import { formatDate } from "@/lib/utils";

export default function BlogCard({ post, index = 0 }: { post: IPost; index?: number }) {
  return (
    <motion.article className="card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}>
      <Link href={`/blog/${post.slug}`} className="card__img" tabIndex={-1} aria-hidden>
        {post.featuredImage ? <Image src={post.featuredImage} alt="" fill sizes="(max-width:700px) 100vw, 33vw" /> : <span className="ph">{post.category}</span>}
      </Link>
      <div className="card__body">
        <p className="meta">{post.category} · {post.readingTime} min read</p>
        <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
        <p className="muted">{post.excerpt}</p>
        <p className="meta">{post.author} · <time dateTime={post.publishedAt || post.createdAt}>{formatDate(post.publishedAt || post.createdAt)}</time></p>
        <Link href={`/blog/${post.slug}`} className="link">Read more</Link>
      </div>
    </motion.article>
  );
}
