# Task Management App

A modern task management application built with React, Material UI, and Supabase.

## Features

- Clean, mobile-friendly UI
- Task organization with status tracking (Not Started, In Progress, Completed)
- Task prioritization and categorization
- Due date tracking with visual indicators
- Task history tracking
- Real-time updates
- User authentication
- Responsive design

## Tech Stack

- React + Vite
- TypeScript
- Material UI
- Supabase (Backend & Authentication)
- React Router
- date-fns

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Setup

Make sure you have the following environment variables set up in your Vercel deployment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Setup

The application requires a Supabase database with the following tables:

- profiles
- tasks
- task_history
- task_comments

SQL scripts for table creation and setup are available in the repository.

## Deployment

The application is configured for easy deployment on Vercel.
