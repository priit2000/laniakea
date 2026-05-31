# Build Your Cosmic Brain

An interactive thought experiment: turn a colonized supercluster into a galaxy-sized computer and explore the limits of computation in the universe.

Built with React + Vite. Deploys to Cloudflare Pages (free tier) with no server needed — it's a fully static site.

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

This produces a `dist/` folder containing a static `index.html` and a JS bundle. That folder is the entire deployable site.

---

## Deploy to Cloudflare Pages (free)

You have two easy paths. Both are free.

### Path 1 — Connect a Git repo (auto-rebuilds on every push)

1. Push this folder to a GitHub (or GitLab) repository.
2. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick your repo.
4. Set the build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**. Cloudflare installs deps, builds, and publishes. Every future `git push` redeploys automatically.

### Path 2 — Direct upload (no Git, drag-and-drop)

1. Run `npm run build` locally to produce the `dist/` folder.
2. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
3. Drag the **contents of the `dist/` folder** (not the folder itself) into the uploader.
4. Publish.

To update later, rebuild and re-upload.

### Path 3 — Wrangler CLI (optional)

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist
```

---

## Notes

- The site is 100% static — no backend, no environment variables, no database. The free Cloudflare Pages tier is more than enough.
- The whole bundle is ~56 KB gzipped, so it loads fast and stays well under any free-tier limits.
- Custom domain: in the Pages project, go to **Custom domains** and add yours — Cloudflare handles HTTPS automatically.
