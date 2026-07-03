# InternX Deployment Guide

## Stack
- Backend: Java 21, Spring Boot 4, MySQL
- Frontend: React + Vite, deployed on Vercel
- Tunnel: Cloudflare Tunnel (free)

## Quick Start

### Backend
```bash
cd InternX
./mvnw spring-boot:run
```

### Frontend
```bash
cd internx-frontend
npm install
npm run dev
```

### Auto-deploy script
Run un-me.ps1 (Windows) — starts backend, tunnel, updates Vercel automatically.

## Live
Frontend: https://intern-x-beige.vercel.app
