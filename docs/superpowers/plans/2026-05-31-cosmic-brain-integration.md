# Cosmic Brain Integration Instructions

> **For agentic workers:** implement this task with explicit checkpoints. Do not guess paths. Every file path below is absolute and points to the current repository on this machine.

**Goal:** Replace the removed/old compute explorer with Claude's `Build Your Cosmic Brain` interactive page, while keeping the colonization explorer and compute text article working.

**Current repository root:** `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea`

**Current live domain:** `https://laniakea.kallas.biz`

**Important current state:** the old `laniakea-compute-explorer.jsx` has already been removed from the main app in the current working tree. The new Claude app is currently present as an untracked standalone folder at `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain`.

---

## My Part

My part is to integrate Claude's `cosmic-brain` app into the existing Laniakea React/Vite site, not to redesign it.

I should:

- Use Claude's component as the new interactive compute page.
- Keep the existing colonization explorer at `/`.
- Keep the colonization Markdown article at `/laniakea-colonization`.
- Keep the compute Markdown article available as a separate text page.
- Remove the old compute explorer completely.
- Preserve the Cloudflare Pages static deployment model.
- Verify locally and on `https://laniakea.kallas.biz` before reporting completion.

I should not:

- Recreate the old compute visualization.
- Add backend services, Workers, databases, KV, R2, or paid Cloudflare features.
- Install a second React runtime from `cosmic-brain`.
- Replace the whole site with the standalone `cosmic-brain` Vite app.
- Modify `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain` in place unless explicitly requested. Treat it as source material.

---

## Source Files

Read these source files before editing:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.jsx`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.test.jsx`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain\src\CosmicBrainBuilder.jsx`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain\package.json`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\package.json`

The existing main app uses React 19:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\package.json`

Claude's standalone app declares React 18:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain\package.json`

Do not merge Claude's package dependencies into the main project unless the build fails and the missing dependency is real. The component only uses React state and memoization, so the main React 19 install should be enough.

---

## Target Routes

Implement these routes in:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.jsx`

Required route behavior:

- `/` renders the existing colonization explorer from `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-colonization-explorer.jsx`.
- `/laniakea-colonization` renders the Markdown article from `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-colonization.md`.
- `/laniakea-compute` renders Claude's `Build Your Cosmic Brain` interactive component.
- `/laniakea-compute-text` renders the Markdown article from `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-compute.md`.
- `/laniakea-compute-article` should either keep working as an alias for the compute Markdown article or redirect-style render the same article in-app. Keeping it as an alias is simplest.

Recommended nav labels:

- `Explorer` -> `/`
- `Colonization` -> `/laniakea-colonization`
- `Compute` -> `/laniakea-compute`
- `Compute Text` -> `/laniakea-compute-text`

---

## File Changes To Make

### 1. Add Claude's component to the main app

Create this file:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\CosmicBrainBuilder.jsx`

Content source:

- Copy the component from `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain\src\CosmicBrainBuilder.jsx`.

Required cleanup while copying:

- Keep `import React, { useState, useMemo } from "react";`.
- Keep the default export `export default function CosmicBrainBuilder()`.
- Keep its internal `CSS` string for now.
- Do not copy `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain\src\main.jsx`.
- Do not copy `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain\index.html`.
- Do not copy `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain\vite.config.js`.

Check the copied component for visible encoding damage in browser-rendered text. The source seen in PowerShell may display the checkmark as mojibake, but the browser is the source of truth.

### 2. Update the main app routes

Modify this file:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.jsx`

Required import:

```jsx
import CosmicBrainBuilder from "./CosmicBrainBuilder.jsx";
```

Keep this import:

```jsx
import CosmicColonizationExplorer from "../cosmic-colonization-explorer.jsx";
```

Required article map:

```jsx
const ARTICLES = {
  "/laniakea-colonization": {
    title: "Laniakea Colonization",
    markdown: colonizationMarkdown,
  },
  "/laniakea-compute-text": {
    title: "Laniakea Compute",
    markdown: computeMarkdown,
  },
  "/laniakea-compute-article": {
    title: "Laniakea Compute",
    markdown: computeMarkdown,
  },
};
```

Required nav:

```jsx
const navItems = [
  { href: "/", label: "Explorer" },
  { href: "/laniakea-colonization", label: "Colonization" },
  { href: "/laniakea-compute", label: "Compute" },
  { href: "/laniakea-compute-text", label: "Compute Text" },
];
```

Required render logic:

```jsx
export default function App() {
  const path = normalizePath(window.location.pathname);
  const article = ARTICLES[path];
  const isComputeBuilder = path === "/laniakea-compute";

  return (
    <>
      <style>{siteCss}</style>
      <div className="site-shell">
        <SiteNav activePath={article || isComputeBuilder ? path : "/"} />
        {article ? (
          <ArticlePage {...article} />
        ) : isComputeBuilder ? (
          <CosmicBrainBuilder />
        ) : (
          <CosmicColonizationExplorer />
        )}
      </div>
    </>
  );
}
```

### 3. Remove old compute explorer leftovers

Confirm this file does not exist:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-compute-explorer.jsx`

Confirm this import does not exist anywhere:

```jsx
import LaniakeaComputeExplorer from "../laniakea-compute-explorer.jsx";
```

Search command:

```powershell
rg -n "LaniakeaComputeExplorer|laniakea-compute-explorer|The Computation Cluster|Ancestor Reconstruction|Whole cluster reflection" "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea"
```

Expected result:

- No old compute explorer import.
- No old compute explorer component file.
- Test negative assertions may mention old labels only if they are explicitly asserting absence.

### 4. Decide what to do with the standalone folder

The folder:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain`

Recommended handling:

- Keep it untracked until the integration is verified.
- After the integrated component works, remove the standalone app folder from the repository working tree if the user confirms it is only source material.

Do not commit both the copied integrated component and the standalone Vite app unless the user explicitly wants to keep Claude's original source package in the repo.

The zip file:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain.zip`

Recommended handling:

- Do not commit it.
- Remove it after confirmation or leave it untracked.

The screenshot:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-compute-text-live.png`

Recommended handling:

- Do not commit it.
- Delete it before final commit unless the user explicitly wants screenshots stored.

---

## Tests To Write First

Modify this test file:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.test.jsx`

Add or update tests so they describe the final behavior before implementation.

### Test: nav exposes Compute and Compute Text separately

Expected behavior:

- `Compute` links to `/laniakea-compute`.
- `Compute Text` links to `/laniakea-compute-text`.
- `Colonization` still links to `/laniakea-colonization`.

Suggested assertions:

```jsx
expect(screen.getByRole("link", { name: "Compute" })).toHaveAttribute("href", "/laniakea-compute");
expect(screen.getByRole("link", { name: "Compute Text" })).toHaveAttribute("href", "/laniakea-compute-text");
expect(screen.getByRole("link", { name: "Colonization" })).toHaveAttribute("href", "/laniakea-colonization");
```

### Test: compute route renders Claude builder

Set route:

```jsx
window.history.pushState({}, "", "/laniakea-compute");
```

Expected assertions:

```jsx
expect(await screen.findByRole("heading", { name: "Build Your Cosmic Brain" })).toBeInTheDocument();
expect(screen.getByRole("radiogroup", { name: "Number of stars used" })).toBeInTheDocument();
expect(screen.getByRole("radiogroup", { name: "Operating temperature" })).toBeInTheDocument();
expect(screen.getByRole("radiogroup", { name: "Amount of matter used for memory" })).toBeInTheDocument();
expect(screen.getByRole("radiogroup", { name: "Energy source" })).toBeInTheDocument();
expect(screen.getByLabelText("How long the civilization runs, in years")).toBeInTheDocument();
```

Negative assertions:

```jsx
expect(screen.queryByRole("heading", { name: "Laniakea Compute" })).not.toBeInTheDocument();
expect(screen.queryByRole("heading", { name: "The Computation Cluster" })).not.toBeInTheDocument();
expect(screen.queryByRole("button", { name: "Ancestor Reconstruction" })).not.toBeInTheDocument();
```

### Test: compute builder interactions update output

Set route:

```jsx
window.history.pushState({}, "", "/laniakea-compute");
```

Actions:

```jsx
await userEvent.click(screen.getByRole("radio", { name: "1 quadrillion" }));
await userEvent.click(screen.getByRole("radio", { name: "3 K" }));
await userEvent.click(screen.getByRole("radio", { name: "Burn the mass reserve" }));
```

Expected assertions:

```jsx
expect(screen.getByRole("radio", { name: "1 quadrillion" })).toHaveAttribute("aria-checked", "true");
expect(screen.getByRole("radio", { name: "3 K" })).toHaveAttribute("aria-checked", "true");
expect(screen.getByRole("radio", { name: "Burn the mass reserve" })).toHaveAttribute("aria-checked", "true");
expect(screen.getByText(/temporary boost|burning matter|savings/i)).toBeInTheDocument();
```

### Test: compute text moves to `/laniakea-compute-text`

Set route:

```jsx
window.history.pushState({}, "", "/laniakea-compute-text");
```

Expected assertions:

```jsx
expect(await screen.findByRole("heading", { name: "Laniakea Compute" })).toBeInTheDocument();
expect(screen.getByText(/Laniakea Computation Cluster/i)).toBeInTheDocument();
expect(document.body.textContent).toMatch(/K = \(log10 P - 6\) \/ 10/i);
expect(document.body.textContent).not.toMatch(/\\frac|\\odot|\\times|\\text|\[\s*K/);
```

### Test: colonization explorer still works

Keep the existing home-route test in:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.test.jsx`

It should still verify:

- Heading `The Colonization Horizon`.
- Scale controls.
- Canvas labels such as `Milky Way` and `Virgo Cluster`.

---

## Commands To Run

All commands should be run from:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea`

Because PATH is unreliable in this shell, prefer direct Node calls:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\node_modules\vitest\vitest.mjs' run
```

Expected result:

- All tests pass.

Build command:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\node_modules\vite\bin\vite.js' build
```

Expected result:

- Vite build completes.
- New bundle is written under `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\dist`.

Search for old compute explorer:

```powershell
rg -n "LaniakeaComputeExplorer|laniakea-compute-explorer|The Computation Cluster|Ancestor Reconstruction|Whole cluster reflection" "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea"
```

Expected result:

- No production references to the old compute explorer.
- Only negative tests may mention old labels.

---

## Live Verification

Deploy to Cloudflare Pages with Wrangler from:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea`

Command:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Users\priit\AppData\Local\npm-cache\_npx\32026684e21afda6\node_modules\wrangler\bin\wrangler.js' pages deploy 'C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\dist' --project-name laniakea
```

Expected result:

- Wrangler uploads assets.
- Wrangler prints `Deployment complete`.

Verify these URLs in a browser or Playwright:

- `https://laniakea.kallas.biz/`
- `https://laniakea.kallas.biz/laniakea-colonization`
- `https://laniakea.kallas.biz/laniakea-compute`
- `https://laniakea.kallas.biz/laniakea-compute-text`
- `https://laniakea.kallas.biz/laniakea-compute-article`

Required live results:

- `https://laniakea.kallas.biz/` shows `The Colonization Horizon`.
- `https://laniakea.kallas.biz/laniakea-colonization` shows `Laniakea Colonization`.
- `https://laniakea.kallas.biz/laniakea-compute` shows `Build Your Cosmic Brain`.
- `https://laniakea.kallas.biz/laniakea-compute` does not show `The Computation Cluster`.
- `https://laniakea.kallas.biz/laniakea-compute` does not show `Ancestor Reconstruction`.
- `https://laniakea.kallas.biz/laniakea-compute-text` shows `Laniakea Compute`.
- `https://laniakea.kallas.biz/laniakea-compute-text` renders formula boxes without raw `\frac`, `\odot`, `\times`, or `**`.

Recommended Playwright live checks:

```js
const { chromium } = require("playwright");

(async () => {
  const stamp = Date.now();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(`https://laniakea.kallas.biz/laniakea-compute?verify=${stamp}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("text=Build Your Cosmic Brain", { timeout: 30000 });
  const computeText = await page.locator("body").innerText();
  await page.getByRole("radio", { name: "1 quadrillion" }).click();
  await page.getByRole("radio", { name: "3 K" }).click();
  await page.getByRole("radio", { name: "Burn the mass reserve" }).click();

  await page.goto(`https://laniakea.kallas.biz/laniakea-compute-text?verify=${stamp}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("text=Laniakea Compute", { timeout: 30000 });
  const computeArticleText = await page.locator("body").innerText();
  const computeFormulaHtml = await page.locator(".formula").first().evaluate((element) => element.innerHTML);

  await page.goto(`https://laniakea.kallas.biz/?verify=${stamp}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("text=The Colonization Horizon", { timeout: 30000 });
  const canvasData = await page.locator("canvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const data = context.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100)).data;
    let sum = 0;
    for (let index = 0; index < data.length; index += 4) sum += data[index] + data[index + 1] + data[index + 2];
    return { width: canvas.width, height: canvas.height, sum };
  });

  const checks = {
    computeBuilderWorks: computeText.includes("Build Your Cosmic Brain"),
    oldComputeGone: !computeText.includes("The Computation Cluster") && !computeText.includes("Ancestor Reconstruction"),
    computeTextWorks: computeArticleText.includes("Laniakea Compute") && computeFormulaHtml.includes("log<sub>10</sub>"),
    homeCanvasWorks: canvasData.width > 300 && canvasData.height > 200 && canvasData.sum > 1000,
    noErrors: errors.length === 0,
  };

  await browser.close();
  console.log(JSON.stringify({ checks, errors, canvasData }, null, 2));
  if (Object.values(checks).some((ok) => !ok)) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Run the Playwright script with:

```powershell
@'
PASTE_SCRIPT_HERE
'@ | & 'C:\Program Files\nodejs\node.exe' -
```

---

## Commit Scope

Before committing, inspect status:

```powershell
git status -sb
```

Expected files to commit:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.jsx`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.test.jsx`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\CosmicBrainBuilder.jsx`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-compute-explorer.jsx` as deleted, if it is still tracked and should remain removed.

Expected files not to commit unless explicitly requested:

- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain.zip`
- `C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-compute-text-live.png`

Suggested commit:

```powershell
git add "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.jsx" "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\App.test.jsx" "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\src\CosmicBrainBuilder.jsx" "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-compute-explorer.jsx"
git commit -m "Integrate cosmic brain compute page"
git push
```

If `git add` reports that `laniakea-compute-explorer.jsx` does not exist, use:

```powershell
git add -A "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea"
git reset "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain.zip"
git reset "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\cosmic-brain"
git reset "C:\Users\priit\OneDrive\projektid\amperly\ai-tools-coding-chatgpt\laniakea\laniakea-compute-text-live.png"
```

Then inspect:

```powershell
git status -sb
```

Only commit the intended integration files.

---

## Final Report Requirements

The final report must include:

- The live URL for Claude's compute page: `https://laniakea.kallas.biz/laniakea-compute`.
- The live URL for compute text: `https://laniakea.kallas.biz/laniakea-compute-text`.
- The exact test command run and result.
- The exact build command run and result.
- Confirmation that the old compute explorer labels are absent from `/laniakea-compute`.
- Confirmation that the colonization explorer still renders on `/`.
- The commit hash after push.
