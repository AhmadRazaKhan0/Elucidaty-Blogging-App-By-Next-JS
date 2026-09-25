import { Suspense } from "react";
import type { Metadata } from "next";
import BlogGrid from "@/components/BlogGrid";
import { APP_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Browse every article on software, design and engineering.",
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: { title: "Blog | Elucidaty", description: "Browse every article on software, design and engineering.", url: `${APP_URL}/blog`, siteName: "Elucidaty" },
};

export default function BlogPage() {
  return (
    <main className="wrap section">
      <h1 className="h1">All articles</h1>
      <p className="lead muted">Search by keyword or filter by category.</p>
      <Suspense fallback={<div className="skel" />}><BlogGrid /></Suspense>
    </main>
  );
}
