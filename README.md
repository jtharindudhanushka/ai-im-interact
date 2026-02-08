# AI@IM - Live User Engagement Portal

A real-time Q&A and Polling platform for live events.

## Features

- **Participant View**: Ask text questions (moderated) and vote on polls (instant).
- **Moderator Dashboard**: Approve/Reject text questions in real-time.
- **Display Screen**: Beautiful, animated Word Cloud for questions and Live Bar Charts for polls.
- **Admin Dashboard**: Create events, manage polls, and view analytics.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Animations**: Framer Motion

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials.
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Database Setup**:
   Run the SQL script found in `supabase/migrations/0000_init.sql` in your Supabase SQL Editor.

4. **Run Locally**:
   ```bash
   npm run dev
   ```

## Deployment

Refer to `DEPLOYMENT.md` (or the Walkthrough artifact) for detailed Vercel deployment instructions.
