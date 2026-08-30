"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircuitBoard, Moon, Sun } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/build", label: "Build" },
  { href: "/recommend", label: "Recommend" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme !== "dark";
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("patchbay-theme", next ? "dark" : "light");
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="AI Patchbay home">
        <span className="brand-mark"><CircuitBoard size={18} /></span>
        <span>AI Patchbay</span>
        <span className="brand-version">V1</span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? "active" : ""}>
            {link.label}
          </Link>
        ))}
      </nav>
      <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} theme`}>
        {dark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  );
}
