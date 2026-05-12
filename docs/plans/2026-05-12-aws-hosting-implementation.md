# AWS Hosting — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the NakshatraTalks Next.js 15 website to the existing EC2 host as a new Docker container behind the existing `nakshatra-nginx`, served at `https://app.nakshatratalks.com`, with GitHub Actions auto-deploy on push to `main`.

**Architecture:** Multi-stage `node:20-alpine` Docker build producing a Next.js standalone server. New `nakshatra-website` service added to the existing `/home/ubuntu/nakshatra/docker-compose.yml`. New nginx server block added for the `app.` subdomain with Let's Encrypt TLS. CI/CD via GitHub Actions runs `git pull && docker compose up -d --build nakshatra-website` over SSH.

**Tech Stack:** Next.js 15 (App Router, standalone output), Node 20 Alpine, Docker Compose, nginx:alpine, certbot, GitHub Actions.

**Source design:** [2026-05-12-aws-hosting-design.md](2026-05-12-aws-hosting-design.md)

**Server context:**
- EC2: `i-002921dc4e92eaafa` (t3.medium, ap-south-1b)
- Elastic IP: `13.204.193.212` (`api.nakshatratalks.com`)
- App dir on host: `/home/ubuntu/nakshatra/`
- Reverse proxy container: `nakshatra-nginx` (image `nginx:alpine`)
- Existing TLS dir: `/etc/letsencrypt/live/api.nakshatratalks.com/`
- SSH: `ubuntu@13.204.193.212` with `nakshatra.pem`

---

## Phase A — Repo prep (local, autonomous)

### Task A1: Add Next.js standalone output

**Files:** Modify `next.config.js`

**Step 1:** Add `output: 'standalone'` to the `nextConfig` object so `npm run build` emits a self-contained Node bundle at `.next/standalone/`.

```js
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: { /* unchanged */ },
  async headers() { /* unchanged */ },
};
```

**Step 2:** Verify the change is just one additional line at the top of `nextConfig`.

```
git diff next.config.js
```

Expected: one `+ output: 'standalone',` line.

### Task A2: Add `.dockerignore`

**Files:** Create `.dockerignore`

```
node_modules
.next
.git
.gitignore
.env*
!.env.example
README.md
docs
.vscode
.idea
.playwright-mcp
*.log
.DS_Store
Thumbs.db
nakshatra.pem
.claude
.env.local.production.backup
```

Rationale: keep the Docker build context small and prevent any local secrets file from being baked into the image.

### Task A3: Add `Dockerfile`

**Files:** Create `Dockerfile` in repo root.

```dockerfile
# syntax=docker/dockerfile:1.7

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nextjs

# Copy the standalone bundle, static assets and public dir
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Notes:
- `npm ci` is reproducible and uses the lockfile only
- The `runner` stage is < 200 MB because it only carries the standalone bundle, not `node_modules`
- Non-root user mitigates impact of any container escape
- `HOSTNAME=0.0.0.0` is required for Next.js standalone to listen on all interfaces inside the container

### Task A4: Verify the build locally

**Command:**
```
npm run build
```

**Expected output:**
- Builds successfully without errors
- Final line shows route summary table
- A `.next/standalone/server.js` file exists when build completes

**If it fails:**
- TypeScript errors → fix and re-run
- Missing env vars → none should be required at build time for this app; if any appear, note them as required `NEXT_PUBLIC_*` runtime values

### Task A5: Build the Docker image locally to catch issues early

**Command:**
```
docker build -t nakshatra-website:dev .
```

**Expected:**
- All three stages complete
- Final image is ~150–250 MB
- `docker images nakshatra-website` lists the image

**If Docker isn't running on the laptop**: skip A5; we'll discover issues when building on the server in Phase C. (Faster but slightly riskier.)

### Task A6: Commit and push A1–A4

```
git add next.config.js .dockerignore Dockerfile
git commit -m "feat(deploy): add Dockerfile + standalone output for AWS hosting"
git push origin main
```

---

## Phase B — DNS (user-driven, BLOCKING)

### Task B1: Add A record in Vercel DNS

**Cannot be automated** — Vercel DNS is web-UI / Vercel API access only, and I don't have Vercel credentials.

**Manual steps for user:**
1. Open Vercel dashboard → Domains → `nakshatratalks.com`
2. Add new record:
   - Type: `A`
   - Name: `app`
   - Value: `13.204.193.212`
   - TTL: `300`
3. Save

### Task B2: Verify DNS propagation

```
nslookup app.nakshatratalks.com 8.8.8.8
```

**Expected:** Returns `13.204.193.212`. Usually within 1–5 minutes. **Do not proceed to Phase C until this resolves**, because Let's Encrypt HTTP-01 challenge will fail otherwise.

---

## Phase C — Server-side deploy (autonomous over SSH)

### Task C1: Clone the repo to the server

**On EC2:**
```
ssh ubuntu@13.204.193.212
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps
git clone https://github.com/Magicalprince/NakshatraTalks-Website.git
cd NakshatraTalks-Website
git checkout main
```

If the repo is private (which it is — `Magicalprince/NakshatraTalks-Website`): use a **deploy key** (read-only SSH key authorized for the repo). Generate it in Task F1 first if not done.

### Task C2: Create the website env file on the server

**On EC2:**

```
cat > /home/ubuntu/apps/NakshatraTalks-Website/.env.production <<'EOF'
NEXT_PUBLIC_API_BASE_URL=https://api.nakshatratalks.com
NEXT_PUBLIC_SUPABASE_URL=<see existing .env.production>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<see existing .env.production>
EOF
chmod 600 .env.production
```

**Note:** Read the actual values from `/home/ubuntu/nakshatra/.env.production` (already on the server) to keep the website pointing at the same Supabase instance as the backend.

### Task C3: Extend `/home/ubuntu/nakshatra/docker-compose.yml`

Add a new service block:

```yaml
  nakshatra-website:
    build:
      context: /home/ubuntu/apps/NakshatraTalks-Website
      dockerfile: Dockerfile
    image: nakshatra-website:latest
    container_name: nakshatra-website
    restart: unless-stopped
    env_file:
      - /home/ubuntu/apps/NakshatraTalks-Website/.env.production
    expose:
      - "3000"
    networks:
      - default
    mem_limit: 700m
    mem_reservation: 300m
```

Adjust `networks:` to whatever the other services use — must be the same network as `nakshatra-nginx` so the proxy can resolve `nakshatra-website` by name.

### Task C4: Add nginx server block for `app.nakshatratalks.com`

Inspect `nakshatra-nginx`'s config mount first:

```
docker inspect nakshatra-nginx --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'
```

Add a new file at the host-side path that's mounted into `/etc/nginx/conf.d/` (or `/etc/nginx/sites-enabled/`):

```nginx
# HTTP → HTTPS redirect + ACME challenge
server {
    listen 80;
    listen [::]:80;
    server_name app.nakshatratalks.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.nakshatratalks.com;

    ssl_certificate     /etc/letsencrypt/live/app.nakshatratalks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.nakshatratalks.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://nakshatra-website:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

If `options-ssl-nginx.conf` or `ssl-dhparams.pem` don't exist on this host, drop those `include` lines or copy them from another Let's Encrypt-managed nginx.

### Task C5: Validate nginx config WITHOUT reloading yet

The 443 server block will fail validation because the cert doesn't exist yet. **Issue the cert first, then validate, then reload.**

### Task C6: Build the website image

```
cd /home/ubuntu/nakshatra
docker compose build nakshatra-website
```

**Expected:** image `nakshatra-website:latest` is created. Watch memory during build — if it OOMs (likely on t3.medium with 4 GB RAM and the backend running), fall back to building on the laptop and `docker save | ssh ... docker load`.

### Task C7: Start the container (still no public exposure yet)

```
docker compose up -d nakshatra-website
docker compose ps nakshatra-website
docker logs --tail 30 nakshatra-website
```

**Expected log:**
- `▲ Next.js 15.5.x`
- `- Local:        http://localhost:3000`
- `✓ Ready in NNN ms`

### Task C8: Issue TLS certificate (HTTP-01 challenge)

Method depends on how the existing `api.nakshatratalks.com` cert was issued. Likely one of:

**Option (a) — certbot on the host writing to a shared volume:**
```
sudo certbot certonly --webroot -w /var/www/certbot \
  -d app.nakshatratalks.com \
  -m <admin email> --agree-tos -n
```

**Option (b) — certbot inside a container that mounts `/etc/letsencrypt`:**
```
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d app.nakshatratalks.com \
  -m <admin email> --agree-tos -n
```

We'll inspect the existing setup and match it.

**Expected:** new dir at `/etc/letsencrypt/live/app.nakshatratalks.com/` containing `fullchain.pem` and `privkey.pem`.

### Task C9: Validate and reload nginx

```
docker exec nakshatra-nginx nginx -t
docker exec nakshatra-nginx nginx -s reload
```

**Expected:** `nginx: configuration file /etc/nginx/nginx.conf test is successful` and no errors on reload.

### Task C10: Smoke test

From the laptop:
```
curl -I https://app.nakshatratalks.com/
nslookup app.nakshatratalks.com 8.8.8.8
```

**Expected:**
- HTTP/2 200, `server: nginx/1.29.5`
- A `Set-Cookie` or HTML response
- TLS cert valid

From a browser:
- Open `https://app.nakshatratalks.com`
- Verify lock icon, login flow, dashboard, chat, call placement

**Hold here if anything fails — do not proceed to Phase F (CI/CD) until manual deploy is fully stable.**

---

## Phase D — Smoke test checklist (manual)

- [ ] Home page loads at `https://app.nakshatratalks.com`
- [ ] HTTPS certificate is valid (browser shows green/lock)
- [ ] Login works
- [ ] Dashboard renders with realtime data
- [ ] Chat session can be initiated end-to-end
- [ ] Call session can be placed (Twilio Video connects)
- [ ] Astrologer dashboard works
- [ ] Multi-device toggle UI works as expected
- [ ] `api.nakshatratalks.com` is still healthy (no regression on backend)

---

## Phase E — (deferred) — Encryption / hardening

Not part of this deploy. Tracked separately:
- EBS volume encryption
- Restrict SSH to user's IP
- Move from launch-wizard SG to a properly tagged SG with description

---

## Phase F — GitHub Actions CI/CD

### Task F1: Generate a deploy key on the server

**On EC2:**
```
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "github-actions-deploy"
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Output to capture for GitHub Secrets:**
- Private key contents of `~/.ssh/github_deploy` (for `AWS_SSH_PRIVATE_KEY`)
- Public IP: `13.204.193.212` (for `AWS_SSH_HOST`)
- User: `ubuntu` (for `AWS_SSH_USER`)

### Task F2: Add GitHub Secrets

**Cannot be automated for safety** — User pastes secrets into:

GitHub → repo `Magicalprince/NakshatraTalks-Website` → Settings → Secrets and variables → Actions → **New repository secret**

Three secrets:
- `AWS_SSH_PRIVATE_KEY` ← the ed25519 private key contents
- `AWS_SSH_HOST` ← `13.204.193.212`
- `AWS_SSH_USER` ← `ubuntu`

### Task F3: Add the deploy workflow

**Files:** Create `.github/workflows/deploy-website.yml`

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'
      - 'Dockerfile'
      - '.dockerignore'
      - 'next.config.js'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/deploy-website.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.AWS_SSH_HOST }}
          username: ${{ secrets.AWS_SSH_USER }}
          key: ${{ secrets.AWS_SSH_PRIVATE_KEY }}
          script: |
            set -euo pipefail
            cd /home/ubuntu/apps/NakshatraTalks-Website
            git fetch origin main
            git reset --hard origin/main
            cd /home/ubuntu/nakshatra
            docker compose build nakshatra-website
            docker compose up -d nakshatra-website
            docker compose ps nakshatra-website
            # Wait up to 60s for readiness
            for i in $(seq 1 30); do
              if docker exec nakshatra-website wget -qO- http://localhost:3000/ > /dev/null 2>&1; then
                echo "Website is ready"
                exit 0
              fi
              sleep 2
            done
            echo "Website did not become ready"
            docker logs --tail 50 nakshatra-website
            exit 1
```

### Task F4: Commit and push the workflow

```
git add .github/workflows/deploy-website.yml
git commit -m "ci(website): add GitHub Actions auto-deploy on push to main"
git push origin main
```

### Task F5: Verify CI/CD runs end-to-end

- Watch the Actions tab in GitHub for the run triggered by Task F4
- Expected: green ✓ within 5–10 minutes
- If red: read the run log, diagnose, fix, repeat

---

## Success criteria

- `https://app.nakshatratalks.com` returns 200 with valid TLS
- Login + dashboard + chat + call all work
- Pushing any commit touching the website to `main` triggers an automatic deploy that completes within 10 minutes
- `https://api.nakshatratalks.com` continues to work throughout

## Rollback

- **Container fails to start:** `docker compose stop nakshatra-website` — `app.nakshatratalks.com` returns 502 from nginx but `api.*` keeps working.
- **Cert issuance fails:** comment out the 443 server block, leave the 80-only block, work the issue, reload nginx.
- **Bad commit deployed:** SSH to server, `cd /home/ubuntu/apps/NakshatraTalks-Website && git reset --hard <good-sha>` and `cd /home/ubuntu/nakshatra && docker compose up -d --build nakshatra-website`.

## Notes for the executor

- Don't touch `nakshatra-prod` or the Supabase containers under any circumstance.
- Always `nginx -t` before reload; if the test fails, the website is the only thing breaking — keep `api.nakshatratalks.com` working.
- The instance has 4 GB RAM. If the Docker build OOMs during Phase C, switch to building on the laptop and shipping the image (`docker save → ssh → docker load`).
