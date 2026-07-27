# Deploy on AWS EC2

Use an Amazon Linux 2023 or Ubuntu 22.04 EC2 instance with Docker installed.

## 1. Security group

Open inbound:

- `22` (SSH) from your IP
- `80` / `443` if you terminate TLS on the instance or put an ALB in front
- `3000` only for direct testing (prefer ALB/Nginx → container)

## 2. Install Docker (Amazon Linux 2023)

```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and back in so the `docker` group applies. Install Compose plugin if needed:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

## 3. Deploy the app

```bash
git clone https://github.com/Ankitmohanty2/akshar-kitaab.git
cd akshar-kitaab
docker compose up -d --build
```

App listens on `http://<EC2-public-IP>:3000`.

Useful commands:

```bash
docker compose ps
docker compose logs -f web
docker compose pull   # if using a registry image
docker compose up -d --build
```

## 4. Optional: Nginx reverse proxy

Point Nginx (or an ALB) at `127.0.0.1:3000` and terminate HTTPS there. Keep the container bound to port 3000 only on localhost if you proxy:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

## Notes

- Word-to-PDF needs LibreOffice inside the image — do not deploy this app as Vercel serverless.
- Prefer `t3.medium` or larger for LibreOffice conversions.
- Files are processed in temporary directories and cleaned up after each request.
