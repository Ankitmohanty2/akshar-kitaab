# Akshar Kitaab

> Perfect your PDFs effortlessly. A fast, privacy-first PDF toolkit for converting, editing, and managing documents.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Ankitmohanty2/akshar--kitaab-blue?style=flat-square)](https://github.com/Ankitmohanty2/akshar-kitaab)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## Features

### Convert
- Image to PDF
- Word to PDF (LibreOffice, preserves layout)
- PDF to Word

### Edit
- Extract Images
- Merge PDFs
- Split PDFs
- Compress PDFs

### Security & Privacy
- Self-hosted processing on your own server
- No paid plans or upgrade walls
- No trackers or ads
- Open source

## Quick start

### Prerequisites
- **Docker** (recommended; includes LibreOffice for Word-to-PDF)
- Or Node.js 20+, npm, and a local LibreOffice install

### Run with Docker Compose

```bash
git clone https://github.com/Ankitmohanty2/akshar-kitaab.git
cd akshar-kitaab
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

```bash
docker compose logs -f web
docker compose down
```

### Local development

```bash
npm install
npm run dev
```

For Word-to-PDF outside Docker, install LibreOffice and ensure `soffice` is on `PATH`, or set `LIBREOFFICE_PATH`.

## Deploy on AWS EC2

See [deploy/ec2/README.md](deploy/ec2/README.md).

Short version on an EC2 instance with Docker installed:

```bash
git clone https://github.com/Ankitmohanty2/akshar-kitaab.git
cd akshar-kitaab
docker compose up -d --build
```

Use `t3.medium` or larger for LibreOffice conversions. Prefer Nginx or an ALB in front of port `3000`.

This app is not designed for Vercel serverless — Word conversion needs LibreOffice in the container.
