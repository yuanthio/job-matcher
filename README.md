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
    ├── app/                    # Next.js App Router (Pages & Layouts)
    ├── components/             # Reusable UI components
    ├── lib/                    # Supabase client & utility functions
    ├── hooks/                  # Custom React hooks
    ├── types/                  # TypeScript type definitions
    ├── public/                 # Static assets
    ├── styles/                 # Global styles
    ├── .env.example            # Environment variable template
    └── README.md               # Project documentation

## Getting Started
