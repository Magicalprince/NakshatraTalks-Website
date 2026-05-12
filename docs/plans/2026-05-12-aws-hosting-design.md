# AWS hosting for NakshatraTalks website (app.nakshatratalks.com)

**Status:** Draft — design only, no implementation yet
**Date:** 2026-05-12
**Author:** Drafted with Claude Code

## Goal

Deploy `NakshatraTalks-Website` (Next.js 15 App Router) to AWS on the subdomain
`app.nakshatratalks.com`, colocated with the existing backend on the same EC2
instance, with automated deploys from `main`.

## Constraints and existing context

- **EC2 instance:** `i-002921dc4e92eaafa` (t3.medium, 2 vCPU, 4 GB RAM) in `ap-south-1b`
- **Elastic IP:** `13.204.193.212` (associated 2026-05-12)
- **Backend at `api.nakshatratalks.com`** runs as a Docker container (`nakshatra-prod`)
  alongside a full self-hosted Supabase stack (~15 containers) and an
  `nginx:alpine` reverse-proxy container (`nakshatra-nginx`)
- The `nakshatra-nginx` container publishes host ports 80 and 443 and proxies to
  the backend container internally on the Docker network
- TLS for `api.nakshatratalks.com` is managed by certbot under
  `/etc/letsencrypt/live/api.nakshatratalks.com/`
- All app state lives in self-hosted Supabase (Postgres + Auth + Storage +
  Realtime), reached by the backend over the internal Docker network
  (`http://supabase-kong:8000`)
- DNS for `nakshatratalks.com` is managed by Vercel DNS (zone served by Vercel
  even though the root domain was purchased on GoDaddy)
- Current free RAM ≈ 1.5 GB, swap ≈ 2 GB (untouched), disk ≈ 18 GB free of 56 GB

## Non-goals

- Migration to a separate EC2 instance or to ECS/Fargate (deferred; revisit if
  the instance ever becomes RAM-constrained)
- Static export to S3/CloudFront (incompatible with the SSR / server-action
  features the codebase uses)
- AWS Amplify hosting (locks into Amplify's build flow; outside this design)
- Credential rotation for the existing compromise (separately tracked and
  declined for now)

## Approach: Dockerized Next.js as a new container in the existing stack

The cleanest fit for the current architecture is to add a new container,
`nakshatra-website`, to the existing Docker setup and reuse the existing
`nakshatra-nginx` container as the TLS terminator and reverse proxy.

```
                                Internet
                                   │
                                   ▼
       ┌──────────────────── EC2 instance ─────────────────────┐
       │                                                       │
       │  nakshatra-nginx (host :80 / :443)                    │
       │   ├─ api.nakshatratalks.com  → nakshatra-prod:4000    │ (existing)
       │   └─ app.nakshatratalks.com  → nakshatra-website:3000 │ (new)
       │                                                       │
       │  nakshatra-prod (NestJS backend, internal :4000)      │
       │  nakshatra-website (Next.js SSR, internal :3000)      │ (new)
       │  supabase-* (Postgres, Auth, Storage, Realtime, ...)  │
       │                                                       │
       └───────────────────────────────────────────────────────┘
```

### Why this shape

- **No new EC2 cost.** Reuses the running instance. The t3.medium has
  measured headroom (1.5 GB free RAM with the backend up). Next.js SSR
  needs roughly 200–400 MB at idle; 600–800 MB peak under load.
- **One TLS terminator.** Reuses the existing `nakshatra-nginx` and the
  existing certbot setup. No second nginx, no port conflicts.
- **Docker symmetry.** The deployment story matches what the backend
  already does, so the team only has one mental model.
- **Failure isolation at the process level.** A Next.js OOM or crash takes
  down the `nakshatra-website` container only; `nakshatra-prod` and the
  Supabase stack keep running.

### Why NOT alternatives

- **PM2 / bare-metal Node:** would mix two different process supervisors on
  the same host and break the symmetry above
- **Separate t3.small for the website:** ~$8–18/month for marginal isolation
  benefit; can be revisited if the shared host ever becomes constrained
- **ALB + target groups:** $25+/month for a load balancer that buys nothing
  at single-instance scale

## Components

### 1. `Dockerfile` (new, in repo root)

Multi-stage build:

1. **deps stage:** `npm ci --omit=dev` against `package-lock.json`
2. **builder stage:** copy app source, run `npm run build`. Uses
   `output: 'standalone'` (added in `next.config.js`) so the build emits a
   self-contained server bundle.
3. **runner stage:** `node:20-alpine`, copy `.next/standalone/`, `.next/static/`,
   and `public/`. Run as non-root user `nextjs`. Expose 3000.

The image should be lean (~150–250 MB) and fast to rebuild (Docker layer cache).

### 2. `next.config.js` change

Add `output: 'standalone'` so the build emits a minimal Node bundle suitable
for Docker.

### 3. `docker-compose.yml` change (on the server, at `/home/ubuntu/nakshatra/`)

Add the `nakshatra-website` service with:

- `image`: built locally on the server during deploy (no registry push)
- `restart: unless-stopped`
- `expose: 3000` (internal only — no host-port publish)
- network: same as `nakshatra-nginx` so it can reach by container name
- `env_file: .env.website.production` (created on the server, not in git)
- depends_on: none — the website does not require any container at start

### 4. `nakshatra-nginx` config addition

Add a new server block for `app.nakshatratalks.com`:

```nginx
server {
    listen 443 ssl http2;
    server_name app.nakshatratalks.com;

    ssl_certificate     /etc/letsencrypt/live/app.nakshatratalks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.nakshatratalks.com/privkey.pem;

    location / {
        proxy_pass http://nakshatra-website:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $proxy_scheme;
    }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name app.nakshatratalks.com;
    return 301 https://$host$request_uri;
}
```

WebSocket headers included because Next.js dev features and React Server
Components streaming use upgraded connections.

### 5. TLS for the new subdomain

Use the existing certbot setup. Two reasonable strategies:

- **Sidecar approach:** `certbot --webroot` against a shared webroot mounted
  in both `nakshatra-nginx` and a one-shot certbot container. Cleanest with
  the current Docker layout.
- **Host certbot:** invoke certbot on the host that writes to the mounted
  `/etc/letsencrypt` path the nginx container already reads.

We'll pick after inspecting how the existing `api.nakshatratalks.com` cert is
renewed — same mechanism for the new cert.

### 6. DNS

Add A record in **Vercel DNS dashboard**:

```
app.nakshatratalks.com  A  13.204.193.212  TTL 300
```

### 7. Environment variables

The website needs a small set of public env vars. The exact list is in
`src/lib/api.ts` / `src/lib/services/*.ts`, but at minimum:

- `NEXT_PUBLIC_API_BASE_URL = https://api.nakshatratalks.com`
- `NEXT_PUBLIC_SUPABASE_URL = https://api.nakshatratalks.com` (or a public Supabase URL routed via Kong)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon key, public by design>`
- Any Twilio-Video / feature-flag env vars the codebase references

These go in `/home/ubuntu/nakshatra/.env.website.production` on the server,
NOT in the git repo.

### 8. CI/CD (GitHub Actions, on push to `main`)

A `.github/workflows/deploy-website.yml` that:

1. Triggers on push to `main` for paths affecting the website
2. SSH'es to the EC2 instance using a deploy key stored in GitHub Secrets
3. Runs a small deploy script on the server: `git pull`, `docker compose build nakshatra-website`, `docker compose up -d nakshatra-website`
4. Verifies the new container is healthy before declaring success

**Required GitHub Secrets:**
- `AWS_SSH_PRIVATE_KEY`: a dedicated deploy key (NOT `nakshatra.pem` — generate a new one with limited shell access)
- `AWS_SSH_HOST`: `13.204.193.212` or `app.nakshatratalks.com`
- `AWS_SSH_USER`: `ubuntu`

A dedicated `deploy` user with only `git pull` + `docker compose` permissions
is preferable to giving Actions full `ubuntu` access. Out of scope for v1;
can tighten later.

## Data flow at runtime

```
User browser
    │
    ▼  https://app.nakshatratalks.com/dashboard
nginx :443 (TLS terminate, SNI match app.*)
    │
    ▼  http://nakshatra-website:3000/dashboard (Docker network)
Next.js SSR
    │  ┌─────────────────────────────────────────────────┐
    │  │ Server-side fetches (for SSR pages):            │
    │  ▼ http://nakshatra-prod:4000/api/...              │ (Docker network)
    │                                                    │
    │  ┌─────────────────────────────────────────────────┘
    │  │ Client-side fetches (in user's browser):
    │  ▼ https://api.nakshatratalks.com/api/...
    │
HTML/RSC stream back to user
```

The website can talk to the backend either over the internal Docker network
(server-side, fast, no TLS) or over the public internet (client-side, normal
TLS). Both must be supported because Next.js does both.

## Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Build OOMs on t3.medium (4 GB RAM) | Medium | Build fails, deploy aborts | Use `node:20-alpine` base, multi-stage build, swap available (2 GB). If still OOM, build on GitHub Actions and ship the built image instead. |
| Memory pressure after both containers run | Medium | Backend slowdowns or OOM-kills | Set explicit `mem_limit: 600m` on the website container so it can't starve the backend. Monitor for 24h. |
| Cert renewal collision | Low | New cert misses renewal | Test renewal flow with `--dry-run` once. |
| nginx config typo breaks `api.*` site | Low | Backend down | Always `nginx -t` (validate config) before reload. CI deploy script does this. |
| Public app surfaces a Supabase ANON_KEY that was leaked in the compromise | Low | Auth bypass | Out of scope: cred rotation is declined. Note in design that we're shipping with pre-existing leaked keys. |
| GitHub Actions SSH key leaks | Low | Server access | Use dedicated deploy key with `command="..."` in `authorized_keys` to limit shell access. |
| Next.js 15 + standalone output incompatibility with our use of Twilio Video | Low | Runtime errors | Validate by running `npm run build` locally first; smoke-test all real-time features after deploy. |

## Step-by-step deployment plan (high level)

1. **Code prep (local)**
   - Merge `feat/multi-device-foundation` → `main` (after final review)
   - Add `output: 'standalone'` to `next.config.js`
   - Add `Dockerfile`
   - Add `.dockerignore`
   - Validate `npm run build` locally

2. **DNS**
   - Add `app.nakshatratalks.com A 13.204.193.212` in Vercel DNS

3. **Server prep**
   - SSH to EC2
   - Add new service block to `/home/ubuntu/nakshatra/docker-compose.yml`
   - Add new server block to nginx config (mounted in `nakshatra-nginx`)
   - Create `/home/ubuntu/nakshatra/.env.website.production`
   - Issue TLS cert for `app.nakshatratalks.com`
   - `docker compose build nakshatra-website`
   - `docker compose up -d nakshatra-website`
   - `docker exec nakshatra-nginx nginx -t && docker exec nakshatra-nginx nginx -s reload`

4. **Smoke test**
   - `curl https://app.nakshatratalks.com/` returns 200
   - Auth flow works end-to-end
   - Realtime / chat / call features connect through the public API

5. **CI/CD**
   - Generate a dedicated deploy SSH key on the server
   - Add private key + host + user to GitHub Secrets
   - Add `.github/workflows/deploy-website.yml`
   - Test the workflow by pushing a no-op change to `main`

## Success criteria

- `https://app.nakshatratalks.com` returns the homepage HTML over TLS
- A user can log in and reach the dashboard
- Realtime chat messages flow
- A call can be placed and the Twilio Video session connects
- Pushing a commit to `main` re-deploys the site within 5 minutes
- Backend (`api.nakshatratalks.com`) is unaffected throughout

## Open questions

- Exact list of `NEXT_PUBLIC_*` env vars the runtime needs — to be enumerated
  by grepping the codebase during implementation
- Whether the production build needs `NEXT_PUBLIC_SUPABASE_URL` pointing at
  Kong directly or routed via the backend — depends on whether website code
  uses `supabase-js` directly
- Whether to run `npm run build` on the server (saves bandwidth) or build in
  GitHub Actions and ship the artifact (better isolation, faster server-side
  deploy)

These resolve during implementation. The design above doesn't depend on the
answers.

## Next step

Move to the `superpowers:writing-plans` workflow to produce a detailed,
file-level implementation plan derived from this design.
