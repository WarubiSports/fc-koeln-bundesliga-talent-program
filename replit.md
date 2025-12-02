# Warubi Multi-Tenant Sports Platform

## Overview

The Warubi platform is a multi-tenant web application hosting multiple apps for the Warubi Sports ecosystem. The platform now features:

1. **Warubi Hub Player Evaluation** (Landing Page `/`): A multi-step evaluation wizard for American club players (MLS NEXT, ECNL, PPL, GA, etc.) that computes Score, Bucket, Rating, and Tags visible to the player.

2. **Warubi Ecosystem** (`/ecosystem.html`): The original showcase page connecting players and coaches to elite pathways (Bundesliga development, college scholarships, pro representation, coaching licenses).

3. **FC Köln ITP Brochures** (`/itp-men.html`, `/itp-women.html`): Scrollable brochure pages with embedded YouTube videos for the International Talent Program.

4. **FC Köln Management System**: Full-stack app for managing FC Köln's international talent program with player management, facility coordination, and administrative tasks.

5. **Admin Evaluations** (`/admin-evaluations.html`): Staff view for filtering and reviewing player evaluation submissions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Branding**: Official 1.FC Köln logo and visual identity integrated.
- **UI Library**: shadcn/ui components built on Radix UI primitives.
- **Styling**: Tailwind CSS with custom CSS variables.
- **Design Philosophy**: Professional styling with gradients, smooth animations, clarity, ease of use, and simplified dashboards.
- **Design Principles**: Prioritizes generous whitespace, mobile-first progressive enhancement, FC Köln brand consistency (red and slate grays), and accessibility (high contrast, large touch targets).
- **Spacing Standards**: Utilizes 90vh minimum for main interfaces, 3rem padding for major sections, 1.75rem+ for main headers, and 56px minimum for primary action buttons.
- **Component Design**: Cards with 16-20px border radius, subtle shadows, and hover animations; large input fields with brand color glow; spacious sidebar layouts.
- **Animation Guidelines**: Smooth micro-interactions (scale on hover), fadeInUp for loading states, and subtle transitions for state changes.
- **Responsive Breakpoints**: Adapts spacing for mobile, tablet, and desktop views.

### Technical Implementation
- **Frontend**: React with TypeScript, Vite, TanStack React Query for state, and React Hook Form with Zod validation.
- **Backend**: Node.js with Express.js for a REST API.
- **Database**: PostgreSQL (configured for Neon serverless) managed by Drizzle ORM and Drizzle Kit.
- **Authentication**: Token-based with role-based access control (admin, staff, player), isolated functions (`auth-core.js`), and continuous monitoring (`system-monitor.js`). Multi-tenancy implemented with `app_id` columns and isolation verification.
- **Key Features**: Player management, administrative dashboard, event scheduling, facility booking, notification system, individual grocery ordering with budget limits, internal messaging, chore management, player profile management (view/edit personal info, emergency contacts, medical conditions), and security controls.
- **Monorepo Structure**: Clear separation between client, server, and shared type definitions.
- **Event Handling**: Uses data attributes with event delegation to prevent JavaScript string escaping issues.
- **Production Build**: Fixed to ensure consistent deployment using `fc-koln-stable-permanent.js`.
- **Configuration**: Environment variables, separate dev/prod configurations, and TypeScript path mapping.
- **Platform Infrastructure**: API key authentication (SHA256), per-app rate limiting, CORS management, and an admin API.

### System Design Choices
- **Authentication Stability**: Modular architecture with immutable `auth-core.js`, isolated feature functions in `features-module.js`, and continuous integrity checks via `system-monitor.js`.
- **Multi-tenancy**: Implemented with `app_id` columns across all database tables to ensure data isolation for different applications. All UPDATE/DELETE queries enforce app_id checks.
- **Deployment Reliability**: Transitioned from Express to Node.js built-in HTTP module for zero-dependency deployment.
- **Observability**: Production monitoring with request logging, correlation IDs, metrics collection, and structured JSON logging.
- **Developer Experience**: Comprehensive onboarding guide, clean middleware architecture, and proper error handling.

### Security Hardening (December 2025)
- **Password Reset Security**: Reset tokens are SHA-256 hashed before storage, with 1-hour expiry enforced. Rate limited to 3 requests per email per hour.
- **Brute-Force Protection**: Login attempts limited to 5 per email, with 15-minute lockout after exceeded.
- **AI Response Validation**: 30-second timeout on Gemini API calls, Zod schema validation on all AI responses.
- **Service Resilience**: Retry with exponential backoff and circuit breaker pattern for Gemini AI and SendGrid email services.
- **Startup Validation**: Required environment variables (DATABASE_URL, JWT_SECRET) checked at startup; warnings for optional keys.
- **Database Constraints**: Unique email per tenant, NOT NULL on users.app_id, foreign keys on event_attendance and grocery_order_items.
- **Database Indexes**: Composite indexes on (app_id, status), (app_id, user_id), (app_id, date) for optimized multi-tenant queries.
- **Zod Validation Middleware**: Reusable validation middleware created for body, query, and params validation.

### Post-Launch Tech Debt
- Split 2,300-line fckoln.mjs into modular route files (auth, chores, grocery, events, players).

## External Dependencies

- **Neon Database**: Serverless PostgreSQL hosting.
- **SendGrid**: Email delivery service.
- **Replit**: Development and hosting platform.
- **Radix UI**: Unstyled, accessible component primitives.
- **shadcn/ui**: Pre-built component library for UI.
- **Tailwind CSS**: Utility-first CSS framework.
- **TypeScript**: Programming language for type safety.
- **Vite**: Frontend build tool.
- **Drizzle Kit**: Database migration and introspection tools.