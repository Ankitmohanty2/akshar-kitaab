# 📚 Akshar Kitaab

> **Perfect your PDFs effortlessly.** A beautiful, fast, and privacy-first PDF toolkit for converting, editing, and managing your documents.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-akshar--kitaab.vercel.app-blue?style=flat-square)](https://akshar-kitaab.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Ankitmohanty2/akshar--kitaab-blue?style=flat-square)](https://github.com/Ankitmohanty2/akshar-kitaab)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## ✨ Features

### 🔄 Convert
- **Image to PDF** - Convert JPG, PNG, or GIF images into PDF documents
- **Word to PDF** - Transform DOC and DOCX files to PDF format
- **PDF to Word** - Extract content from PDFs and convert to editable Word documents

### ✏️ Edit
- **Extract Images** - Pull all images from your PDF files with ease
- **Merge PDFs** - Combine multiple PDF files into one
- **Split PDFs** - Remove or extract specific pages from PDF documents
- **Compress PDFs** - Reduce file size without losing quality

### 🔐 Security & Privacy
- ✅ **Self-hosted Processing** - Documents are processed by your own application server
- ✅ **No Trackers** - Complete privacy, your documents stay with you
- ✅ **No Ads** - Clean, distraction-free experience
- ✅ **Open Source** - Transparent, auditable code

## 🚀 Quick Start

### Prerequisites
- **Docker** (recommended; includes LibreOffice for accurate Word-to-PDF conversion)
- Or **Node.js 20+**, npm, and a local LibreOffice installation

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ankitmohanty2/akshar-kitaab.git
cd akshar-kitaab
```

2. **Build and run with Docker**
```bash
docker build -t akshar-kitaab .
docker run --rm -p 3000:3000 akshar-kitaab
```

Open [http://localhost:3000](http://localhost:3000).

For development outside Docker, install LibreOffice and ensure `soffice` is on `PATH`, or set `LIBREOFFICE_PATH` to the executable:

```bash
npm install
npm run dev
```
