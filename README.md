# 💼 Job Matcher — CV-Based Job Recommendation Platform

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge)](https://ui.shadcn.com/)

**Job Matcher** is a modern **CV-based job recommendation web application** that helps users discover relevant job opportunities based on their skills, experience, and uploaded CV data.  
The platform is built with a clean, scalable frontend architecture and a cloud-based backend powered by **Supabase**.

🌐 **Live Demo:** https://job-matcher-eight.vercel.app/

---

## ✨ Key Features

- **CV Upload & Parsing**  
  Users can upload their CV to be analyzed for skills and experience.

- **Job Recommendation Engine**  
  Matches CV data with job requirements to suggest relevant opportunities.

- **Authentication & User Profiles**  
  Secure authentication and user management using Supabase Auth.

- **Modern & Responsive UI**  
  Built with **Tailwind CSS** and **shadcn/ui** for a clean, accessible experience.

- **Cloud-Native Backend**  
  Uses Supabase (PostgreSQL + Auth) without a separate backend server.

---

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend / Platform
- Supabase
  - Authentication
  - PostgreSQL Database
  - Serverless APIs

---

## 📂 Project Structure

    ```text
    job-matcher/
    ├── public/                   # Static assets (favicon, images, etc.)
    ├── src/                      # Main source code
    │   ├── app/                  # Next.js App Router (pages/layouts)
    │   ├── components/           # Reusable UI components
    │   ├── lib/                  # Supabase client & helper functions
    │   ├── hooks/                # Custom React hooks
    │   ├── types/                # TypeScript type definitions
    │   └── styles/               # Global & utility styles
    ├── .gitignore                # Files to ignore in Git
    ├── components.json           # Editor components config
    ├── eslint.config.mjs         # ESLint configuration
    ├── next.config.ts            # Next.js configuration
    ├── package.json              # Dependencies & scripts
    ├── postcss.config.mjs        # Tailwind/PostCSS config
    ├── tsconfig.json             # TypeScript config
    ├── tsconfig.cron.json        # Cron TS config (if any)
    └── README.md                 # Project documentation

## Getting Started
1. Clone Repository
   ```bash
   git clone https://github.com/yuanthio/job-matcher.git
   cd job-matcher
2. Install Dependencies
   ```bash
   npm install
3. Environment Variables
   Create a .env.local file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Run Development Server
   ```bash
   npm run dev

## Project Goals
Job Matcher is built to demonstrate:
- Clean Frontend Architecture with Next.js App Router
- Effective use of Supabase as Backend-as-a-Service
- CV-based data processing & job matching logic
- Modern UI implementation using Tailwind CSS & shadcn/ui
- Scalable and maintainable codebase suitable for production


