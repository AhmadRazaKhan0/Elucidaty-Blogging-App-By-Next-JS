import Link from "next/link";
export default function NotFound() {
  return (
    <main className="wrap section center">
      <h1 className="h1">Page not found</h1>
      <p className="muted">The page you’re looking for doesn’t exist or was unpublished.</p>
      <Link href="/blog" className="btn">Back to Blog</Link>
    </main>
  );
}
