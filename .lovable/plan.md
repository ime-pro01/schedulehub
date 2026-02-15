

# Personal Productivity & Study Hub

## Overview
A gamified, cyberpunk-themed study productivity dashboard that transforms your CSV study schedule into an interactive, motivating experience. All data is structured to connect to your FastAPI + PostgreSQL backend via API calls.

---

## Design & Theme
- **Dark mode by default** with a cyberpunk/tech aesthetic — deep navy blues, neon cyan & purple accents, subtle glassmorphism (backdrop-blur, semi-transparent cards)
- **Framer Motion animations** throughout — cards fade/slide in, progress rings animate, XP counters tick up
- **Lucide-react icons** for all iconography
- **Shadcn UI components** as the foundation, styled with the cyberpunk palette

---

## Pages & Features

### 1. Dashboard (Home)
- **Daily Focus Panel** — Shows today's upcoming and current tasks based on the schedule, with the active task highlighted in neon
- **Progress Ring** — Animated circular progress showing today's task completion percentage (e.g., 7/14 tasks done = 50%)
- **Streak Counter** — Displays consecutive days where you completed all tasks, with flame animations
- **XP & Level Display** — Total XP earned, current level, and progress bar to next level
- **Quick Stats** — Tasks completed this week, missed tasks, recovery rate

### 2. Schedule View (Weekly Calendar)
- **Google Calendar-style weekly grid** — Time slots on the Y-axis (8:30 AM – 1:30 AM), days on the X-axis
- **Pre-loaded with your CSV data** — Your 16 daily time blocks parsed and displayed with color-coded categories (Projects & Research = blue, HackerRank = green, Book Writing = purple, etc.)
- **Task Status Toggles** — Click any task to mark it as Pending, Completed, or Missed
- **CSV Re-import** — Upload a new CSV anytime to refresh the schedule
- **Current time indicator** — A horizontal line showing "now" on today's column

### 3. Focus Mode (Zen Mode)
- **Distraction-free layout** — Minimal UI showing only the current task and timer
- **Customizable Pomodoro Timer** — Set your own focus and break durations, with animated countdown ring
- **Session counter** — Track how many focus sessions you've completed today
- **Current task context** — Automatically pulls the task from your schedule for the current time slot
- **XP bonus** — Earn bonus XP for completing full Pomodoro sessions

### 4. Gamification System
- **XP Points** — Earn XP for completing tasks on time (e.g., +50 XP per task, +25 bonus for completing before the slot ends)
- **Levels** — Progress through levels as you accumulate XP (Level 1–50 with creative rank names)
- **Streak Tracking** — Track daily completion streaks with visual rewards
- **Recovery Mode** — When a task is marked as "Missed," a modal offers to reschedule it to a free/break slot, earning partial XP

### 5. Notifications & Alerts
- **Toast notifications** for missed tasks using Sonner
- **Missed task summary panel** on the dashboard showing what was missed today
- **API-ready notification hooks** — Frontend structured with service functions (`api/notifications.ts`) ready to call your FastAPI endpoints for email triggers

---

## Technical Architecture (API-Ready)
- **API Service Layer** — All data operations go through a centralized `api/` folder with functions like `fetchSchedule()`, `updateTaskStatus()`, `getXP()`, etc.
- **Currently uses localStorage** as a fallback data store so the app works standalone
- **Easy backend swap** — Each API function has a clear interface; just replace the localStorage calls with `fetch()` calls to your FastAPI endpoints
- **Type-safe data models** — TypeScript interfaces for Schedule, Task, UserProgress, XPTransaction matching what your PostgreSQL schema would look like

---

## CSV Import Flow
1. User clicks "Import Schedule" → file picker opens
2. App parses the CSV (Time column + Mon–Sun columns)
3. Tasks are categorized by keyword detection (e.g., "HackerRank" → category: coding-practice)
4. Schedule populates the weekly calendar view
5. Your uploaded schedule will be pre-loaded as the default data

