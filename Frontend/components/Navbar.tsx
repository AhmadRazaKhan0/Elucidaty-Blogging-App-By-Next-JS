"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [{ href: "/", label: "Home" }, { href: "/blog", label: "Blog" }, { href: "/admin", label: "Write" }];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={scrolled ? "nav is-scrolled" : "nav"}>
      <div className="wrap nav__in">
        <Link href="/" className="logo" onClick={() => setOpen(false)}aria-label="Elucidaty home"><Logo /></Link>
        <button className="nav__btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
        <nav id="menu" aria-label="Main" className={open ? "nav__links is-open" : "nav__links"}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              aria-current={(l.href === "/" ? path === "/" : path.startsWith(l.href)) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
