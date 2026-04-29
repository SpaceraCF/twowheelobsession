# Two Wheel Obsession — Website Rebuild

Replacement for `twowheelobsession.com.au`. Next.js + Payload CMS + Postgres, deploys to Render.

## Repo layout

```
TWO-Website/
├── site/                  # Next.js + Payload app (the actual website)
├── _backup-extracted/     # Extracted .wpress backup — REFERENCE ONLY, gitignored
├── _tools/                # One-off scripts (wpress extractor, migration helpers)
├── www-...wpress          # Original All-in-One WP Migration backup (gitignored)
├── render.yaml            # Render deployment Blueprint
└── README.md
```

## Local dev

```bash
# Postgres (one-time)
brew install postgresql@16
brew services start postgresql@16
createdb twowo_dev

# App
cd site
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000 (public site) and http://localhost:3000/admin (Payload admin).

To seed local data:
```bash
# Create Yamaha brand + bike categories
curl -X POST -H "x-sync-secret: local-dev-sync-secret-change-me" \
  http://localhost:3000/api/internal/yamaha-seed

# Pull live Yamaha catalogue (~76 bikes)
curl -X POST -H "x-sync-secret: local-dev-sync-secret-change-me" \
  http://localhost:3000/api/internal/yamaha-sync

# Sample used bikes
curl -X POST -H "x-sync-secret: local-dev-sync-secret-change-me" \
  http://localhost:3000/api/internal/used-bikes-seed
```

## Architecture

- **New bikes (Yamaha)** — synced hourly from `api.yamaha-motor.com.au`. Render cron triggers `/api/internal/yamaha-sync`.
- **New bikes (Suzuki, CFMOTO, others)** — managed in Payload admin.
- **Used bikes** — managed in Payload admin. Schema designed for one-write → multiple syndication channels (bikesales.com.au feed, future others).
- **Pages, enquiries, service requests** — Payload collections, all forms are server actions writing direct to Payload.
- **bikesales.com.au syndication feed** — see `site/src/lib/feeds/README.md`.

## Deployment to Render

Single-command deploy via Blueprint.

### First deploy (one-time setup)

1. Push this repo to GitHub.
2. In Render dashboard → **New +** → **Blueprint** → connect the GitHub repo.
3. Render reads [`render.yaml`](./render.yaml) and provisions:
   - **Postgres** (`twowo-postgres`, Sydney region, basic-256mb plan)
   - **Web service** (`twowo-site`, Node 22 LTS, persistent 5 GB disk for media uploads)
   - **Cron** (`twowo-yamaha-sync`, hourly Yamaha catalogue refresh)
4. Render auto-generates `PAYLOAD_SECRET`, `SYNC_SECRET`, and `FEED_SECRET` once.
5. First boot — Drizzle pushes the schema into the new Postgres. Watch the logs.
6. Visit `https://twowo-site.onrender.com/admin`, register the first admin user.
7. Trigger the initial Yamaha sync (or wait for the next cron):
   ```bash
   curl -X POST -H "x-sync-secret: $SYNC_SECRET" \
     https://twowo-site.onrender.com/api/internal/yamaha-sync
   ```

### Custom domain

Once `www.twowheelobsession.com.au` is ready to cut over:

1. Render dashboard → `twowo-site` → **Settings** → **Custom Domains** → add `twowheelobsession.com.au` and `www.twowheelobsession.com.au`.
2. Update DNS at the registrar (CNAME or A records per Render's instructions).
3. Render auto-provisions Let's Encrypt certs.
4. **Update `SITE_URL`** env var on `twowo-site` to `https://www.twowheelobsession.com.au`. The cron and bikesales feed both pick this up automatically.

### Subsequent deploys

`autoDeploy: true` is set, so every push to `main` triggers a redeploy.

### Costs (rough, AUD/USD)

| Service | Plan | ~Monthly |
|---|---|---|
| Postgres | basic-256mb (1 GB storage) | $7 USD |
| Web | starter (512 MB RAM) | $7 USD |
| Disk | 5 GB | $1.25 USD |
| Cron | starter | $1 USD |
| **Total** | | **~$16 USD/mo** |

Bump web service to `standard` ($25 USD) if memory pressure shows up.

## What lives where in the backup

- `themes/lusion/` — visual reference (CSS, spacing, colors)
- `plugins/yamaha-woo-sync-updated/` — reference for porting Yamaha sync
- `plugins/yamaha-oem-parts-lookup/` — phase 2 (iframe live initially)
- `uploads/` — bike photos, brand logos (cherry-pick what's used)
- `database.sql` — used bikes need to be migrated; orders/users do not

## Known issues / parked

- **Gear & apparel e-commerce** — parked. Not in v1 scope; revisit after launch.
- **Payment provider for gear** — parked alongside above.
- **Drizzle "push" mode in production** — schema diffs are auto-applied at boot. Move to migrations (`npm run migrate`) before high-stakes schema changes.

## Notes for future contributors

- **Payload CLI uses Node native TypeScript support, not tsx.** Scripts (`generate:types`, `generate:importmap`, `migrate`) pass `--disable-transpile` and rely on Node 23+ stripping types on `.ts` files. Collection imports in `payload.config.ts` use `.ts` extensions and `tsconfig.json` has `allowImportingTsExtensions: true`. Don't switch back to the tsx-based CLI — it has ESM/CJS interop issues with `@next/env`.
