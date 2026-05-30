import React from "react";
import { marked } from "marked";
import CosmicColonizationExplorer from "../cosmic-colonization-explorer.jsx";
import LaniakeaComputeExplorer from "../laniakea-compute-explorer.jsx";
import colonizationMarkdown from "../laniakea-colonization.md?raw";
import computeMarkdown from "../laniakea-compute.md?raw";

const ARTICLES = {
  "/laniakea-colonization": {
    title: "Laniakea Colonization",
    markdown: colonizationMarkdown,
  },
  "/laniakea-compute-article": {
    title: "Laniakea Compute",
    markdown: computeMarkdown,
  },
};

const navItems = [
  { href: "/", label: "Explorer" },
  { href: "/laniakea-compute", label: "Compute" },
  { href: "/laniakea-colonization", label: "Colonization" },
  { href: "/laniakea-compute-article", label: "Compute Text" },
];

marked.setOptions({
  gfm: true,
  breaks: false,
});

function normalizePath(pathname) {
  return pathname.replace(/\/$/, "") || "/";
}

function SiteNav({ activePath }) {
  return (
    <nav className="site-nav" aria-label="Project articles">
      <a className="site-brand" href="/">Laniakea</a>
      <div className="site-links">
        {navItems.map((item) => (
          <a
            key={item.href}
            className={activePath === item.href ? "site-link active" : "site-link"}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ArticlePage({ title, markdown }) {
  const html = marked.parse(`# ${title}\n\n${markdown}`);

  return (
    <main className="article-page">
      <article
        className="article"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}

export default function App() {
  const path = normalizePath(window.location.pathname);
  const article = ARTICLES[path];
  const isComputeExplorer = path === "/laniakea-compute";

  return (
    <>
      <style>{siteCss}</style>
      <div className="site-shell">
        <SiteNav activePath={article || isComputeExplorer ? path : "/"} />
        {article ? <ArticlePage {...article} /> : isComputeExplorer ? <LaniakeaComputeExplorer /> : <CosmicColonizationExplorer />}
      </div>
    </>
  );
}

const siteCss = `
html, body, #root {
  min-height: 100%;
}

body {
  margin: 0;
  background: linear-gradient(160deg, #fbf7ef 0%, #f3ece0 100%);
}

.site-shell {
  min-height: 100vh;
  font-family: 'Spectral', Georgia, serif;
  color: #23211c;
}

.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(16px, 3vw, 28px) clamp(20px, 4vw, 56px) 0;
}

.site-brand,
.site-link {
  text-decoration: none;
}

.site-brand {
  font-family: 'Space Mono', monospace;
  font-size: 15px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #166b46;
  font-weight: 700;
}

.site-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.site-link {
  font-family: 'Space Mono', monospace;
  font-size: 15px;
  color: #4a4538;
  background: #f6f0e4;
  border: 1px solid #d8cfba;
  border-radius: 10px;
  padding: 8px 12px;
  transition: all .18s ease;
}

.site-link:hover,
.site-link.active {
  background: #166b46;
  color: #fff;
  border-color: #166b46;
  box-shadow: 0 4px 14px rgba(22,107,70,0.24);
}

.site-link:focus-visible,
.site-brand:focus-visible {
  outline: 3px solid #0b3d28;
  outline-offset: 2px;
  border-radius: 8px;
}

.article-page {
  max-width: 920px;
  margin: 0 auto;
  padding: clamp(20px, 4vw, 56px);
}

.article {
  background: #fffdf8;
  border: 1px solid #e8e0d0;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(120,100,60,0.07);
  padding: clamp(24px, 4vw, 44px);
  font-size: 18px;
  line-height: 1.65;
}

.article h1,
.article h2,
.article h3 {
  color: #1a1813;
  line-height: 1.1;
}

.article h1 {
  margin: 0 0 20px;
  font-size: clamp(38px, 6vw, 64px);
  font-weight: 800;
}

.article h2 {
  margin: 34px 0 12px;
  font-size: 28px;
}

.article h3 {
  margin: 26px 0 10px;
  font-family: 'Space Mono', monospace;
  font-size: 19px;
}

.article p,
.article ul,
.article ol,
.article table,
.article blockquote {
  margin: 0 0 18px;
}

.article a {
  color: #166b46;
  font-weight: 700;
}

.article table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  display: block;
}

.article th,
.article td {
  border: 1px solid #e8e0d0;
  padding: 8px 10px;
  vertical-align: top;
}

.article th {
  background: #f6f0e4;
}

.article blockquote {
  border-left: 4px solid #166b46;
  padding-left: 16px;
  color: #4a4538;
  font-style: italic;
}

@media (max-width: 700px) {
  .site-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .site-links {
    justify-content: flex-start;
  }
}
`;
