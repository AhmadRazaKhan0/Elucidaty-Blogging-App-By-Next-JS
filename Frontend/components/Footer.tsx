import Link from "next/link";
import Logo from "./Logo";
import { CATEGORIES } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <div><p className="logo"><Logo /></p><p className="muted">Clear writing on software, design and the work around them.</p></div>
        <nav aria-label="Categories" className="footer__cats">
          {CATEGORIES.map((c) => <Link key={c} href={`/blog?category=${c}`}>{c}</Link>)}
        </nav>
      </div>
      <p className="wrap muted small">© {new Date().getFullYear()} Elucidaty</p>
    </footer>
  );
}
