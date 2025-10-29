# FC Köln Management System

## Overview

The "1.FC Köln Bundesliga Talent Program" is a full-stack web application designed to manage FC Köln's international talent program. It offers comprehensive features for player management, facility coordination, and administrative tasks, all branded with official FC Köln identity. The system aims to optimize operations and enhance the development of young talent, with a business vision to streamline processes, improve talent nurturing, and establish a leading sports talent management platform. The platform has achieved production-grade readiness with robust testing and observability features.

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
- **Multi-tenancy**: Implemented with `app_id` columns across all database tables to ensure data isolation for different applications.
- **Deployment Reliability**: Transitioned from Express to Node.js built-in HTTP module for zero-dependency deployment.
- **Observability**: Production monitoring with request logging, correlation IDs, metrics collection, and structured JSON logging.
- **Developer Experience**: Comprehensive onboarding guide, clean middleware architecture, and proper error handling.

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