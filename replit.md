# FC Köln International Talent Program Management System

## Overview

This is a comprehensive web application for managing the FC Köln International Talent Program. The system provides player management, scheduling, communication, house management, and administrative features for coaches, staff, and players.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom FC Köln branding (red theme)
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Token-based authentication with session management
- **API Design**: RESTful endpoints with consistent error handling

### Key Components

1. **Player Management System**
   - Complete player profiles with personal information
   - Position tracking, nationality, and house assignments
   - Status management (active, on trial, inactive)
   - Profile images and emergency contacts

2. **House Management**
   - Three houses: Widdersdorf 1, 2, and 3
   - Chore assignment and tracking system
   - House-specific filtering and management

3. **Calendar & Event System**
   - Team practices, matches, and appointments
   - Event templates for recurring activities
   - Player-specific scheduling

4. **Communication System**
   - Team messaging and notifications
   - Direct messaging between users
   - Announcement system

5. **Food Ordering System**
   - Weekly grocery orders with authentic German grocery data
   - Delivery tracking and cost management
   - House-specific order management

## Data Flow

1. **Authentication Flow**
   - Token-based authentication stored in localStorage
   - Role-based access control (admin, coach, player)
   - Session persistence across browser refreshes

2. **Data Management**
   - All database operations through Drizzle ORM
   - Optimistic updates with React Query
   - Real-time data synchronization

3. **File Structure**
   - `/client` - React frontend application
   - `/server` - Express.js backend API
   - `/shared` - Shared TypeScript schemas and types

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless database hosting
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Managed through Neon's serverless pool

### Authentication
- **Replit Auth**: OIDC-based authentication (production)
- **Simple Auth**: Token-based system for development
- **Session Management**: Express sessions with PostgreSQL store

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Fast development server and build tool
- **TailwindCSS**: Utility-first styling

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Port Configuration**: Internal port 5000, external port 80
- **Hot Reload**: Vite HMR for frontend, tsx for backend

### Production Build
- **Frontend**: Vite build to `/dist/public`
- **Backend**: ESBuild bundle to `/dist/index.js`
- **Static Files**: Served from Express for SPA routing
- **Environment**: Production environment variables

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Schema**: Centralized in `/shared/schema.ts`
- **Seeding**: Initial data setup through SQL scripts

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 17, 2025. Initial setup