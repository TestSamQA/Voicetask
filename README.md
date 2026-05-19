# VoiceTask

Voice-driven family task board. Tap the mic, speak your tasks, and Claude turns them into structured cards you can review and save. Real-time notifications via SignalR. Self-hosted, mobile-first, no OpenAI account required.

## Stack

| Layer | Tech |
|---|---|
| API | .NET 10 Web API |
| Database | PostgreSQL 16 |
| Auth | JWT (access) + HTTP-only refresh cookie |
| Real-time | ASP.NET Core SignalR |
| Speech-to-text | Web Speech API (browser-native, no API key) |
| Task extraction | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Frontend | Angular 21 (standalone + signals) |
| Reverse proxy | nginx |
| Container | Docker Compose |

---

## Prerequisites

- **Docker** and **Docker Compose** (v2+)
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)
- **Chrome on Android** or another browser with Web Speech API support for voice capture

---

## Quick start

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd Voicetask
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
# PostgreSQL
POSTGRES_DB=voicetask
POSTGRES_USER=voicetask
POSTGRES_PASSWORD=<strong password>

# JWT — minimum 32 random characters
JWT_SECRET=<generate with: openssl rand -base64 48>

# CORS — set to your domain or http://localhost for local use
ALLOWED_ORIGINS=http://localhost

# Anthropic Claude (task extraction)
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Start

```bash
docker compose up -d --build
```

The first build takes a few minutes (downloads base images, compiles .NET, builds Angular). Subsequent starts are fast.

Open `http://localhost` in your browser. The first account you register becomes admin.

### 3. Stop / restart

```bash
docker compose down          # stop, keep data
docker compose down -v       # stop + delete all data
docker compose restart       # restart all services
docker compose restart api   # restart just the API
```

---

## Production: HTTPS with a real domain

The nginx container only listens on port 80. For production, terminate TLS in front of it. The Web Speech API **requires HTTPS** — microphone access is blocked on plain HTTP in modern browsers.

### Option A — Caddy (recommended, auto-certificates)

Install Caddy on the host, then create `/etc/caddy/Caddyfile`:

```
voicetask.yourdomain.com {
    reverse_proxy localhost:80
}
```

```bash
sudo systemctl reload caddy
```

Caddy automatically provisions and renews a Let's Encrypt certificate.

### Option B — nginx on the host with Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d voicetask.yourdomain.com
```

Add this to your nginx site config (`/etc/nginx/sites-available/voicetask`):

```nginx
server {
    listen 443 ssl;
    server_name voicetask.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/voicetask.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/voicetask.yourdomain.com/privkey.pem;

    # WebSocket headers required for SignalR
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 86400s;
    }
}

server {
    listen 80;
    server_name voicetask.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### After switching to HTTPS

Update `ALLOWED_ORIGINS` in `.env` to match your domain:

```env
ALLOWED_ORIGINS=https://voicetask.yourdomain.com
```

Then rebuild and restart:

```bash
docker compose up -d --build
```

---

## Updating

```bash
git pull
docker compose up -d --build
```

Database migrations run automatically on API startup — no manual migration step needed.

---

## Data

All persistent data lives in Docker named volumes:

| Volume | Contains |
|---|---|
| `postgres_data` | All tasks, users, notifications, labels |

### Backup

```bash
# Database
docker compose exec db pg_dump -U voicetask voicetask > backup_$(date +%F).sql

# Restore
docker compose exec -T db psql -U voicetask voicetask < backup_2026-05-19.sql
```

---

## Architecture

```
Browser / Phone
      │ HTTPS
      ▼
  nginx :80  ──── /api/*       ──► .NET API :8080
               ── /hubs/*  WS  ──► .NET API :8080  (SignalR)
               ── /*           ──► Angular SPA
```

All services run in the same Docker Compose network. nginx is the only container with a published port.

### Voice flow

```
Tap FAB → SpeechRecognition (browser) → transcript string
       → POST /api/v1/voice/extract → Claude NLP → parsed task cards
       → user reviews / edits cards
       → POST /api/v1/voice/confirm → tasks saved to DB
```

No audio is ever uploaded or stored.

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_DB` | ✓ | Database name |
| `POSTGRES_USER` | ✓ | Database username |
| `POSTGRES_PASSWORD` | ✓ | Database password |
| `JWT_SECRET` | ✓ | HS256 signing key — min 32 chars, keep secret |
| `ALLOWED_ORIGINS` | ✓ | CORS origin(s), comma-separated if multiple |
| `ANTHROPIC_API_KEY` | ✓ | Used for Claude task extraction |

---

## Generating a strong JWT secret

```bash
openssl rand -base64 48
```

Copy the output into `.env` as `JWT_SECRET`.

---

## Mobile (Android / iOS)

The app is mobile-first. On Android Chrome, add it to the home screen for a near-native feel:

1. Open the app URL in Chrome
2. Tap the three-dot menu → **Add to Home screen**
3. The app launches without browser chrome and respects safe-area insets

Voice capture uses the browser's Web Speech API. Chrome on Android supports it well. Safari on iOS supports it from iOS 14.5+. Microphone permission is requested when you first tap the record button.

> **Note:** Voice capture requires HTTPS. On `http://localhost` it works as an exception, but on any other hostname you must have a valid TLS certificate.

---

## Ports (local development only)

When using `docker-compose.override.yml` these extra ports are exposed:

| Port | Service |
|---|---|
| `5432` | PostgreSQL (direct access) |
| `5000` | .NET API (direct access, bypasses nginx) |
| `80` | nginx (full stack) |

The override file is only used in development (`docker compose up` automatically merges it). In CI or production, use `docker compose -f docker-compose.yml up` to exclude it.

---

## Troubleshooting

**App won't start / containers crash**

```bash
docker compose logs          # all services
docker compose logs api      # just the API
docker compose logs db
```

**Database connection refused**

The API waits for the `db` healthcheck to pass before starting. If it keeps restarting, check that `POSTGRES_PASSWORD` in `.env` matches the connection string.

**SignalR notifications not arriving**

Real-time updates use WebSockets. Make sure your proxy forwards the `Upgrade` and `Connection` headers (see the nginx example above). Some corporate firewalls block WebSockets; SignalR falls back to long-polling automatically.

**Microphone button does nothing / voice capture fails**

- The page must be served over HTTPS (or `localhost`). Plain HTTP blocks microphone access.
- On iOS Safari, check that microphone permission is granted under Settings → Safari → Microphone.
- Chrome on Android is the most reliable browser for the Web Speech API.

**First user not becoming admin**

The first `POST /api/v1/auth/register` call promotes that account to Admin. If you need to fix it manually:

```bash
docker compose exec db psql -U voicetask voicetask \
  -c "UPDATE \"Users\" SET \"Role\" = 1 WHERE \"Email\" = 'your@email.com';"
```
