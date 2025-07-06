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

## Recent Changes

### June 21, 2025
- **Calendar Event Creation Bug Fix**: Resolved critical issue where events were created with current date instead of user-selected date
- **Date Handling Improvement**: Modified calendar onSubmit function to properly use form-selected dates for event creation
- **TypeScript Error Resolution**: Fixed all compilation errors in food orders component for smooth operation
- **Database Query Optimization**: Enhanced SQL syntax and error handling in storage layer
- **Players Page Cleanup**: Removed pending approvals section since dedicated user and member management sections exist
- **Push Notifications System**: Implemented browser notifications for events, chores, and messages when players aren't using the app
- **Chore Deletion Fix**: Resolved React Query cache invalidation error preventing chore deletion functionality
- **Smart Chore Rotation**: AI-powered fair distribution system considering workload, experience, and availability with 60% fairness weight
- **House Competition System**: Real-time scoring across categories (chores, punctuality, teamwork, cleanliness, participation) with badges and achievements
- **House Order Summary Fix**: Resolved critical bug preventing order display after placement by fixing date filtering logic and creating comprehensive House Orders page
- **Calendar Event Issues Fix**: Fixed chronological ordering of events in month/week views and resolved event editing functionality by correcting authentication middleware
- **Message Deletion System**: Added comprehensive message deletion with individual message delete buttons and admin bulk delete for all team messages
- **Weekly Grocery Order Refresh**: Updated delivery date selection to refresh every Monday, showing only current week's Tuesday/Friday options with 12pm deadlines

### July 6, 2025
- **Individual Food Ordering Restrictions**: Implemented role-based restrictions so regular players can only place grocery orders for themselves, while admins/coaches retain full ordering capabilities for any player
- **Profile Editing System**: Added comprehensive profile editing functionality allowing registered members to update their personal information, contact details, medical information, and football-specific data post-registration
- **Enhanced Navigation**: Added "Edit Profile" link to main navigation for easy access to profile management
- **Player Update System Fix**: Resolved critical "Update Player" button functionality through comprehensive debugging and database schema updates - fixed authentication permissions, form validation mismatches, cache invalidation issues, and database field mapping for phone numbers and emergency contacts
- **Player-Specific Calendar Visibility**: Enhanced calendar filtering so players see team-wide events, group events they belong to (position, house, age group, nationality), events where they're individually mentioned, and events they created themselves - maintains privacy while ensuring players see relevant information
- **Selective Bulk Delete for Repetitive Events**: Added intelligent duplicate detection with selection interface - groups events by title and participants, displays organized selection modal allowing admins to choose specific duplicates to delete rather than automatic deletion
- **Custom Days Recurring Pattern**: Enhanced calendar recurring events with visual day selection interface - includes quick presets for Training Days (Mon/Wed/Thu/Fri), weekdays, weekends, and custom combinations for flexible scheduling like team practices
- **Custom Days Recurring Pattern Fix**: Fixed critical issue where custom days recurring events weren't being created - added missing database columns for password reset functionality and implemented proper custom days logic in recurring event creation system
- **Bulk Delete Group Selection Fix**: Resolved visual feedback issue where selecting entire groups for deletion showed no indication - improved synchronization between group checkboxes and individual event selection with proper visual highlighting and accurate selection counters

### June 17, 2025
- **Chore Management System**: Fixed all chore functionality issues including precise player filtering, cache invalidation, and house-specific visibility
- **Date Filtering Enhancement**: Implemented comprehensive date filtering for House Order Summary to prevent overwhelming data accumulation over 10-month season
- **Player Authentication**: Resolved chore visibility bug where players saw chores from all houses instead of only their assigned house
- **Cache Strategy**: Enhanced React Query cache invalidation with pattern-based queries for immediate UI updates
- **Cancelled Order Management**: Made cancelled food orders completely disappear from all UI views, statistics, and aggregations
- **10-Month Scalability**: Implemented database indexes and notification cleanup for long-term team management

### Technical Improvements
- Added exact matching for chore assignments instead of broad LIKE queries
- Implemented date range filtering (current week, current month, last month, last 3 months) for food order summaries
- Enhanced house tab filtering on frontend to respect selected house assignments
- Improved admin chore creation with immediate visibility through better cache management
- Added database indexes on events, notifications, and grocery orders for query performance
- Implemented automatic notification cleanup (30-day read, 90-day unread) to prevent database bloat
- Filtered cancelled orders from all backend API responses and frontend displays

## Project Status
✅ **PRODUCTION READY**: Complete team management system with all critical issues resolved. TypeScript compilation errors fixed, database performance optimized with indexes, notification cleanup active, and comprehensive error handling implemented. System validated for smooth 10-month season operation.

Current status: All core systems operational - authentication, player management, food ordering, house management, chore tracking, and communication features fully functional.