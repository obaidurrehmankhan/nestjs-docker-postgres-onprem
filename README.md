# 📝  NestJS + Postgres + NGINX on EC2 with Docker & CI/CD

This project demonstrates how to deploy a **NestJS REST API** (with PostgreSQL database) behind an **NGINX reverse proxy**, all orchestrated with **Docker Compose**, and deployed to an **AWS EC2 Ubuntu 22.04 server** via GitHub Actions → SSH.

---

## 📌 Project Scope & Vision

* **App**: NestJS API with `/todos` CRUD, `/health`, `/ready` endpoints.
* **Database**: PostgreSQL (with persistence + migrations).
* **Reverse Proxy**: NGINX (handles incoming requests, routes traffic to API).
* **Orchestration**: Docker Compose (API + DB + NGINX containers).
* **Server**: AWS EC2 Ubuntu 22.04 (hardened with firewall, non-root user, auto-updates, fail2ban).
* **CI/CD**: GitHub Actions (build, push to GHCR, deploy to EC2).

---

## 🛠️ Steps Completed So Far

### 1. Local Project Setup

1. **Initialize NestJS project**

   ```bash
   nest new onprem-api
   ```

2. **Add Docker support**

   * Created **multi-stage Dockerfile** for NestJS (builder + runner, non-root).
   * Added `.dockerignore`.

3. **Created `docker-compose.yml`**

   * Services:

     * `db` (Postgres 16 with volume + healthcheck).
     * `api` (NestJS app, connected to db).
     * `nginx` (reverse proxy, port 80 exposed).

4. **Configured NGINX (`nginx/app.conf`)**

   * Reverse proxy → `api:3000`.
   * Gzip, timeouts, rate limiting.

✅ Tested locally with:

```bash
docker compose up -d
curl http://localhost/health
```

---

### 2. Prepare AWS EC2 Server

#### Launch EC2 Instance

1. From AWS Console:

   * Ubuntu 22.04 LTS AMI
   * t2.micro (free tier)
   * Allow ports 22, 80, 443 in security group
   * Download PEM key (`on-prem.pem`)

2. Connect from local machine:

   ```bash
   chmod 400 on-prem.pem
   ssh -i on-prem.pem ubuntu@<PUBLIC_IP>
   ```

---

### 3. Server Hardening & Preparation

#### Create Non-Root User (`appuser`)

```bash
sudo adduser appuser
sudo usermod -aG sudo appuser
sudo rsync --archive --chown=appuser:appuser ~/.ssh /home/appuser
```

Login as appuser:

```bash
ssh -i on-prem.pem appuser@<PUBLIC_IP>
```

---

#### Disable Root & Password Login

```bash
sudo nano /etc/ssh/sshd_config
```

Set:

```
PermitRootLogin no
PasswordAuthentication no
```

Restart:

```bash
sudo systemctl restart ssh
```

---

#### Configure Firewall (UFW)

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

---

#### Enable Automatic Security Updates

```bash
sudo apt update
sudo apt install -y unattended-upgrades apt-listchanges
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Confirm:

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```

---

#### Install Fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
sudo systemctl status fail2ban
```

---

#### Install Docker & Compose

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker --version
docker compose version
```

Add user to docker group:

```bash
sudo usermod -aG docker appuser
exit
ssh -i on-prem.pem appuser@<PUBLIC_IP>
docker run hello-world
```

---

#### Create Project Directory

```bash
mkdir ~/onprem-app
cd ~/onprem-app
```

---


#### Files to Copy to Server

Only **infrastructure files** are copied to EC2 (not full source):

```bash
scp -i on-prem.pem -r docker-compose.prod.yml .env nginx appuser@<SERVER_IP>:~/onprem-app/
```

👉 This keeps server lightweight:

* `docker-compose.prod.yml` → renamed to `docker-compose.yml` on server
* `.env` → database & app configs
* `nginx/app.conf` → reverse proxy config

---

#### GitHub Actions → Build & Push Image

#### **Dockerfile**

* Multi-stage (builder → runner).
* Final image contains only compiled code (`dist/`) + production dependencies.

#### **deploy.yml**

Added in `.github/workflows/deploy.yml`:

* Build Docker image from `api/Dockerfile`.
* Push to GitHub Container Registry (GHCR).
* SSH into EC2 → pull image → restart stack → run migrations.

---

#### Environment Setup (`.env`)

On **server** (`~/onprem-app/.env`):

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=appdb
DATABASE_SSL=false
DATABASE_URL=postgresql://postgres:postgres@db:5432/appdb
NODE_ENV=production
PORT=3000
```

👉 Important: `DATABASE_SSL=false` since DB is inside same private Docker network.

---

#### Self-Signed SSL Certificate

On EC2:

```bash
sudo mkdir -p /etc/ssl/onprem
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/onprem/selfsigned.key \
  -out /etc/ssl/onprem/selfsigned.crt \
  -subj "/CN=localhost"
```

---

#### Deployment & Health Check

Deploy stack:

```bash
docker compose pull
docker compose up -d
```

Check logs:

```bash
docker compose logs api --tail=100
```

Health checks:

```bash
# Inside EC2
curl http://localhost/health
# From outside
curl -k https://<PUBLIC_IP>/health
```

---

## ✅ Current Status

* GitHub Actions builds/pushes Docker images automatically.
* EC2 pulls image & runs containers (API + DB + NGINX).
* API is served securely at:

  ```bash
  curl -k https://<PUBLIC_IP>/health
  ```
* NGINX reverse proxy handles traffic, redirects HTTP → HTTPS.
* Postgres persists with Docker volume.

---

👉 Next steps (future): add Let’s Encrypt for real TLS, add monitoring (Grafana + Loki), scale with ECS/K8s.
