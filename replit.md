# FC Köln Management System

## Overview

This is a full-stack web application for managing FC Köln's international talent program. The system provides player management, facility coordination, and administrative features for staff and players. It's built with a React frontend, Express backend, PostgreSQL database using Drizzle ORM, and includes comprehensive UI components via shadcn/ui.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Session-based authentication with token management
- **Email Service**: SendGrid integration for notifications
- **Session Storage**: PostgreSQL-based session store

### Database Strategy
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migration System**: Drizzle Kit for schema migrations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Directory Structure
```
├── client/          # React frontend application
│   └── src/         # Frontend source code
├── server/          # Express backend application
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── dist/            # Production build output
```

### Authentication System
- Token-based authentication with 7-day expiration
- In-memory token storage for development (should be moved to database for production)
- Role-based access control (admin, staff, player roles)
- Session management with PostgreSQL session store

### Database Schema
- User management with role-based permissions
- Player profiles and status tracking
- Event and facility management
- Notification and messaging systems
- Grocery ordering system

## Data Flow

1. **Client Requests**: React frontend makes API calls to Express backend
2. **Authentication**: Requests validated through token-based auth middleware
3. **Database Operations**: Drizzle ORM handles type-safe database interactions
4. **Response Handling**: TanStack Query manages caching and state updates
5. **UI Updates**: Components re-render based on query state changes

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **SendGrid**: Email delivery service for notifications
- **Replit**: Development and hosting platform

### UI Components
- **Radix UI**: Unstyled, accessible component primitives
- **shadcn/ui**: Pre-built component library with consistent design
- **Tailwind CSS**: Utility-first styling framework

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database migration and introspection tools

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- tsx for TypeScript execution in development
- Replit-specific plugins for enhanced development experience

### Production Build
- Multi-stage build process combining frontend and backend
- Static asset serving through Express
- Environment-specific configuration management
- Database migrations run via Drizzle Kit

### Configuration Management
- Environment variables for database connections
- Separate development and production Vite configurations
- TypeScript path mapping for clean imports
- Tailwind configuration with CSS custom properties

### Key Features
- Player management and status tracking
- Administrative dashboard for staff with comprehensive full admin controls
- Event scheduling and facility booking
- Notification system with email integration
- Grocery ordering system for players
- Message system for internal communication
- Full administrator permissions with system-wide controls
- Emergency protocols and security management

### Recent Updates (July 2025)
- **Official Branding Integration**: Added official 1.FC Köln logo throughout the application
- **Complete Rebranding**: Updated from "FC Köln Management System" to "1.FC Köln Bundesliga Talent Program"
- **Logo Implementation**: Integrated FC Köln logo on login page and header with proper static file serving
- **Comprehensive Admin Controls**: Added full administrator control panel with 5 categories of system management
- **Security & Emergency Features**: Implemented security controls, emergency protocols, and system monitoring
- **Enhanced UI/UX**: Professional styling with official FC Köln branding and visual identity
- **Dashboard Overhaul**: Streamlined dashboard with player overview, recent activity timeline, and house competition leaderboard
- **User Preference**: Dashboard simplified to focus on core essentials rather than complex features
- **Advanced Chore Management**: Enhanced housing section with comprehensive chore creation system for Thomas and Max
- **Deadline-Based Assignments**: Staff can create specific chores with deadlines for individuals, groups, or entire houses
- **Priority-Based Task System**: Four-tier priority system (Low, Medium, High, Urgent) with visual indicators
- **Comprehensive Task Management**: Full admin/staff controls for marking complete, extending deadlines, and deleting chores
- **Analytics Dashboard**: Completion tracking, on-time rates, and performance metrics for house management

The application follows a monorepo structure with clear separation between client and server code, shared type definitions, and comprehensive tooling for development and deployment.