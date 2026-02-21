# The Love Vault

<img width="1352" height="1301" alt="image" src="https://github.com/user-attachments/assets/717d4484-5fdc-4618-bb23-7141309a13be" />


A shared journal for tracking acts of love between partners. Each person has their own account, and both see all entries. Includes an "SOS mode" that shows random memories when you need a reminder that everything is okay.

Built as a PWA — installable on your phone's home screen.

## Quick Start (Development)

```bash
npm install
npm run dev
```

Opens the frontend on `http://localhost:5173` with hot reload. The API runs on port 3000 (proxied automatically).

## Deployment

This is designed to run on a Raspberry Pi behind a Caddy reverse proxy, with each service in its own Docker Compose and a shared Docker network.

### 1. One-time setup: create the shared network

```bash
docker network create proxy
```

### 2. Set up Caddy (if you haven't already)

Create a directory for Caddy (e.g. `~/caddy`) with:

**`docker-compose.yml`**:

```yaml
services:
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - proxy

volumes:
  caddy_data:
  caddy_config:

networks:
  proxy:
    external: true
```

**`Caddyfile`**:

```caddyfile
{
    local_certs
}

https://lovevault.rpi-01.lan {
    reverse_proxy lovevault:3000
}

# Add more services here:
# https://photos.rpi-01.lan {
#     reverse_proxy photos:8080
# }
```

Start Caddy:

```bash
cd ~/caddy && docker compose up -d
```

### 3. Set up DNS

You need `*.rpi-01.lan` to resolve to the Pi's IP. Options:

- **Router DNS**: Add entries in your router's DNS settings (if supported)
- **Pi-hole / dnsmasq**: Add a wildcard rule on the Pi:
  ```bash
  echo "address=/.rpi-01.lan/YOUR_PI_IP" | sudo tee /etc/dnsmasq.d/rpi-wildcard.conf
  sudo systemctl restart dnsmasq
  ```
  Then set your router's DHCP DNS server to the Pi's IP.

### 4. Trust the self-signed certificate (one-time)

After Caddy starts, extract its root CA and install it on your devices:

```bash
cd ~/caddy
docker compose exec caddy cat /data/caddy/pki/authorities/local/root.crt > caddy-root.crt
```

Transfer `caddy-root.crt` to your phones/laptops and install it as a trusted certificate. After this, all `*.rpi-01.lan` sites show a green lock.

### 5. Deploy LoveVault

```bash
cp .env.example .env
# Edit .env — set DATA_DIR and SESSION_SECRET
```

```bash
docker compose up -d --build
```

That's it. Access the app at `https://lovevault.rpi-01.lan`.

### Adding more services

1. Add `networks: [proxy]` to the new service's compose file (no `ports` needed)
2. Add a block to the Caddyfile
3. `docker compose restart` Caddy

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `./data` | Host directory for SQLite database files |
| `SESSION_SECRET` | `change-me-to-something-random` | Secret for signing session cookies |

## Backups

All persistent data lives in `DATA_DIR` as SQLite files:

- `lovevault.db` — users and entries
- `sessions.db` — login sessions

```bash
cp -r /mnt/storage/databases/lovevault /mnt/backup/lovevault-$(date +%F)
```

## First Time Setup

1. Open the app in your browser
2. Click "Create Account" — pick a username, password, and your display name
3. Have your partner do the same
4. Start adding memories
