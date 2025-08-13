# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **天机AI (Tianji AI)** - an AI-powered Eastern metaphysics platform that provides personalized divination and fortune-telling services. The project combines traditional Chinese astrology (八字命理), compatibility analysis (合盘), divination (卜卦), and other metaphysical practices with modern AI technology using DeepSeek API.

The platform emphasizes empowerment over fatalism, providing constructive guidance rather than absolute predictions. It uses a virtual credit system called "天机点" (Tianji Points) for monetization.

## Architecture

**Frontend Stack:**
- Next.js 15+ with App Router
- React 19 with TypeScript for type safety  
- Tailwind CSS for styling with amber/slate color scheme
- shadcn/ui components (New York style with Radix UI primitives)
- Lucide React for icons
- next-themes for light/dark theme switching
- Zustand for state management
- React Hook Form + Zod for form validation

**Backend & Database:**
- Supabase for authentication, database, and real-time features
- Cookie-based authentication with SSR support via @supabase/ssr
- Row Level Security (RLS) for data protection
- PostgreSQL database with specialized tables for each analysis type

**AI Integration:**
- DeepSeek API for AI-powered fortune telling and analysis
- OpenAI SDK compatible interface
- Base URL: `https://api.deepseek.com`
- Model: `deepseek-chat`

**Testing Stack:**
- Jest for unit tests
- Playwright for E2E tests
- React Testing Library for component tests
- MSW for API mocking

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Environment Setup

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=[Supabase Project URL]
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[Supabase Anon Key]
DEEPSEEK_API_KEY=[DeepSeek API Key]
```

## Key Architecture Patterns

**Supabase Client Architecture:**
- `/lib/supabase/client.ts` - Browser client for client components  
- `/lib/supabase/server.ts` - Server client for server components/actions
- `/lib/supabase/middleware.ts` - Session management middleware
- Always create new server clients within functions using `await createClient()` (important for Fluid compute)

**Service Layer Pattern:**
- Database operations abstracted into service classes in `/lib/database/services.ts`
- `TianjiPointsService` - Handles all points-related operations (balance, spending, transactions)
- `AnalysisRecordsService` - Manages aggregated history records across all analysis types
- Each service validates authentication and permissions before database operations

**Authentication Flow:**
- Cookie-based auth that works across Client Components, Server Components, Route Handlers, Server Actions, and Middleware
- Protected routes under `/app/protected/`
- Middleware handles session refresh automatically
- User menu component handles auth state and points display

**UI Component System:**
- shadcn/ui components in `/components/ui/` with Radix UI primitives
- Custom components in `/components/` (navbar, forms, etc.)
- Analysis result components in `/components/modules/` (BaziResult, HepanResult, GenericAnalysisResult, etc.)
- Consistent amber/slate color scheme throughout with Song Dynasty aesthetic for dream analysis
- Full light/dark theme support via next-themes
- Responsive design with mobile-first approach
- ReactMarkdown with custom styling for AI-generated content display

**Database Architecture:**
- Separate specialized tables for each analysis type:
  - `bazi_analyses` - 八字分析记录
  - `hepan_analyses` - 合盘分析记录  
  - `bugua_divinations` - 卜卦记录
  - `calendar_fortunes` - 运势记录
  - `name_analyses` - 姓名分析记录
  - `dream_interpretations` - 解梦记录
- `tianji_accounts` and `tianji_transactions` for points system
- `user_profiles` and `user_favorites` for user management
- History aggregation service combines all analysis types into unified history view

**API Route Structure:**
- `/api/[service]/analyze` - Analysis endpoints for each service (bazi, hepan, bugua, calendar, name, dream)
- `/api/history/*` - Aggregated history management across all analysis types
  - `/api/history/records` - GET (list), DELETE (batch delete)
  - `/api/history/records/[id]` - GET (detail), PUT (update), DELETE (single)
- `/api/points/*` - Tianji points balance and transactions
- All APIs use proper Supabase server client with `await createClient()`
- History APIs aggregate data from multiple tables and handle different data formats

## Core Feature Modules

The platform includes 6 main analysis services:

1. **Personal Bazi Analysis (个人八字命盘)** - `/bazi` - Birth chart analysis with AI interpretation (200 points)
2. **Compatibility Analysis (八字合盘)** - `/hepan` - Relationship compatibility scoring (300 points)
3. **Daily Divination (日常卜卦)** - `/bugua` - I Ching style divination with coin toss simulation (150 points)
4. **Daily Fortune Calendar (个人运势日历)** - `/calendar` - Personalized daily fortune readings (100 points)
5. **Name Analysis (姓名学分析)** - `/name` - Chinese name analysis and suggestions (120 points)
6. **Dream Interpretation (AI解梦)** - `/dream` - AI-powered dream analysis (80 points)

**Navigation Architecture:**
- Unified navigation via `components/navbar.tsx` included in root layout
- All 6 services accessible from main navigation
- User menu with points balance, history, profile, and settings
- Responsive design with collapsible mobile menu

## DeepSeek AI Integration

Use the OpenAI SDK with DeepSeek base URL:
```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const completion = await openai.chat.completions.create({
  messages: [{ role: "system", content: "You are a helpful assistant." }],
  model: "deepseek-chat",
});
```

## Business Model

The platform uses a "天机点" (Tianji Points) virtual credit system:
- 1 RMB = 10 Tianji Points
- New users get 100 points free
- Various analysis features cost different amounts of points
- Monthly/yearly subscriptions provide unlimited access to certain features

## Development Guidelines

**File Organization:**
- App Router structure in `/app/` with feature-based routing
- Reusable components in `/components/` and UI components in `/components/ui/`
- Database services and utilities in `/lib/`
- Type definitions in `/lib/types/`
- Supabase clients separated by environment (client/server/middleware)

**Styling:**
- Tailwind CSS with amber/slate color scheme
- Font: Geist Sans with serif fallbacks for Chinese content
- shadcn/ui components with New York style
- Full light/dark theme support
- Responsive design with mobile-first breakpoints

**TypeScript:**
- Strict TypeScript configuration
- Database types generated from Supabase schema
- Proper typing for all Supabase client calls and API responses
- Service classes for database operations

**Critical Implementation Details:**
- Always use `await createClient()` for Supabase server clients in API routes
- History records are aggregated from multiple specialized tables, not a single `analysis_records` table
- Points system uses database RPC functions for transactions via `TianjiPointsService` class
- User display names fallback: `user.user_metadata?.full_name || user.email?.split('@')[0] || '用户'`
- All analysis APIs should validate user authentication and sufficient points before processing
- AI analysis content can be stored as either strings or objects - always handle both types in history APIs
- Dream analysis uses specialized enums and interfaces defined in `/lib/dream/calculator.ts`

**Security:**
- Never expose DEEPSEEK_API_KEY in client-side code
- Use Supabase RLS policies for data access control
- All API routes validate user authentication via Supabase auth
- Input validation using Zod schemas where applicable

## Execution Documents

The project includes detailed execution documents for different development roles:
- `docs/frontend-execution.md` - Frontend development guide
- `docs/backend-execution.md` - Backend/Supabase setup guide  
- `docs/ai-prompt-master-execution.md` - AI integration and prompt engineering
- `docs/prompt.md` - Complete project specification and requirements

These documents should be consulted for detailed implementation guidance for each aspect of the platform.