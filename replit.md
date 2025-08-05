# FC Köln Management System

## Overview

This is a full-stack web application, rebranded as "1.FC Köln Bundesliga Talent Program," for managing FC Köln's international talent program. The system provides comprehensive player management, facility coordination, and administrative features for staff and players, with official FC Köln branding. It aims to streamline operations and enhance the management of young talent.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
- **Database Cleanup (August 1, 2025)**: Removed all test players from player database since Max Bisinger and Thomas Ellinger are administrators, not players
- **Pending Registrations Cleanup**: Removed all pending user registrations (Luis Martinez, Maria Schmidt) from admin queue
- **Chat System Cleanup**: Removed Ahmad Hassan and other test users from communications/chat functionality
- **User Management**: System now properly separates administrators from players - player database is empty and ready for actual player registrations

### Communication System Improvements (August 4, 2025)
- **Fixed User Switching**: Chat window now correctly updates when switching between users/conversations
- **Mobile Layout**: Optimized communication section for mobile devices with proper message display and input field positioning
- **Calendar Event Management**: Fully implemented edit and delete functionality for calendar events
- **Player Profile Editing**: Complete player profile editing functionality with save/cancel buttons and form validation
- **New Group Creation**: Added ability to create new message groups, houses, and direct chats
- **Player Status Control**: Implemented clear UI for managing player availability status (active, injured, suspended, on-loan)
- **Enhanced Mobile Experience**: Added responsive design improvements, back buttons, and touch-friendly interface elements

## System Architecture

### UI/UX Decisions
- **Branding**: Official 1.FC Köln logo and visual identity integrated throughout the application.
- **UI Library**: shadcn/ui components built on Radix UI primitives for a consistent and accessible design.
- **Styling**: Tailwind CSS with custom CSS variables for flexible theming.
- **Design Philosophy**: Professional styling with gradients, smooth animations, and a focus on clarity and ease of use, simplifying dashboards to core essentials.

### Technical Implementation
- **Frontend**: React with TypeScript, using Vite for fast development and optimized builds. State management is handled by TanStack React Query, and forms by React Hook Form with Zod validation.
- **Backend**: Node.js with Express.js for a REST API. It uses Drizzle ORM for PostgreSQL interactions and session-based authentication.
- **Database**: PostgreSQL (configured for Neon serverless) managed by Drizzle ORM and Drizzle Kit for migrations.
- **Authentication**: Token-based authentication with role-based access control (admin, staff, player). Critical authentication functions are isolated, protected, and continuously monitored for stability.
- **Key Features**:
    - Player management and status tracking with a comprehensive editing system.
    - Administrative dashboard with full admin controls (5 categories of system management).
    - Event scheduling and facility booking.
    - Notification system with email integration.
    - Individual grocery ordering system for players with budget limits and delivery deadlines.
    - Internal messaging system.
    - Chore management system for houses with deadlines and priority levels.
    - Security controls and emergency protocols.

### System Design Choices
- **Monorepo Structure**: Clear separation between client, server, and shared type definitions.
- **Authentication Stability**: A modular architecture with `auth-core.js` for immutable authentication functions, `features-module.js` for isolated feature functions, and `system-monitor.js` for continuous integrity checks and recovery. This includes non-writable, non-configurable function properties and multi-layered integrity verification.
- **Production Build**: Fixed production deployment to use `fc-koln-7300-working.js` instead of `app.js` to ensure deployed app matches development preview exactly (January 2025).
- **Configuration**: Environment variables for critical settings, separate configurations for development and production, and TypeScript path mapping.

## External Dependencies

- **Neon Database**: Serverless PostgreSQL hosting.
- **SendGrid**: Email delivery service for notifications.
- **Replit**: Development and hosting platform.
- **Radix UI**: Unstyled, accessible component primitives.
- **shadcn/ui**: Pre-built component library for UI.
- **Tailwind CSS**: Utility-first CSS framework.
- **TypeScript**: Programming language for type safety.
- **Vite**: Frontend build tool.
- **Drizzle Kit**: Database migration and introspection tools.
```