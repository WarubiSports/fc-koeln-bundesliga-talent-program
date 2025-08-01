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

### Google Sheets Integration Issue Resolution (July 2025)
- **ISSUE IDENTIFIED**: Google Sheets integration attempt corrupted JavaScript functionality causing "Unexpected EOF" errors and broken onclick handlers
- **ROOT CAUSE**: Google Sheets integration introduced multiple levels of escaped characters (\\\\\\\\n) in JavaScript template literals, breaking browser JavaScript parsing
- **SPECIFIC CORRUPTION**: 
  1. Template literal escape sequences became over-escaped (4x, 6x, 8x backslashes)
  2. Function scope changed preventing onclick handlers from accessing JavaScript functions
  3. Browser received malformed JavaScript causing "Unexpected EOF" and "Can't find variable" errors
- **SOLUTION APPLIED**: 
  1. Fixed escape sequence corruption in template literals
  2. Made essential functions globally accessible (window.showAuthTab, window.showPage, window.logout)
  3. Preserved full 7300-line sophisticated application
- **PREVENTION MEASURES**:
  1. Always backup working application before external integrations
  2. Test JavaScript functionality immediately after any template literal modifications
  3. Use incremental integration approach rather than bulk modifications
  4. Verify onclick handler functionality after any code changes
- **RESULT**: Full 7300-line application restored with working authentication and all sophisticated features

### Authentication Safety Measures (July 30, 2025)
- **Critical Issue**: Authentication system repeatedly breaking during feature additions
- **Root Causes Identified**: Function scope changes, element ID mismatches, CSS conflicts, template literal corruption
- **Safety Protocol Implemented**: Comprehensive authentication protection system with mandatory pre-change testing
- **Backup System**: Automated authentication backup creation before any modifications
- **Recovery Procedures**: Emergency restoration protocols and function accessibility fixes
- **Protected Elements**: Critical authentication HTML, JavaScript, and CSS now documented and protected
- **Testing Requirements**: Mandatory authentication testing after any system changes
- **Integration Guidelines**: Safe feature addition protocols to prevent authentication regression

### Authentication Permanent Stabilization (July 31, 2025)
- **CRITICAL ISSUE RESOLVED**: Recurring authentication system failures causing project rollbacks and blocking progress
- **ROOT CAUSE**: Template literal structure vulnerable to escape sequence corruption during editing
- **COMPREHENSIVE PROTECTION SYSTEM IMPLEMENTED**: 
  1. Automatic authentication function verification system on page load
  2. Console status reporting for immediate issue detection
  3. Permanent stable backup files (fc-koln-auth-permanent-stable.js)
  4. Enhanced AUTH_SAFETY_PROTOCOL.md with comprehensive protection measures
  5. Continuous monitoring system checking functions every 3 seconds
  6. Emergency function restoration from closure-protected backups
  7. DOM mutation observer detecting structural changes
  8. User notification system for critical failures
- **ARCHITECTURAL ANALYSIS COMPLETED**: Template literal structure identified as root vulnerability
- **FUTURE IMPROVEMENT PLANNED**: Safe file structure implementation when full content extraction is complete
- **CURRENT STATUS**: Working application restored with comprehensive authentication protection
- **RESULT**: Authentication system now self-verifies and reports status, preventing future regressions
- **LESSON LEARNED**: Critical system protection should be implemented proactively, not reactively

### Permanent Authentication Solution Implementation (August 1, 2025)
- **PERMANENT SOLUTION DEVELOPED**: Created protected authentication module to prevent future failures
- **NEW ARCHITECTURE**: 
  1. `auth-module-protected.js` - Immutable authentication functions using Object.defineProperty
  2. Functions cannot be overwritten or corrupted by feature additions
  3. Continuous integrity monitoring with auto-recovery
  4. Complete isolation from main application code
- **PROTECTION MECHANISMS**:
  1. Non-writable, non-configurable function properties
  2. Real-time integrity verification every 10 seconds
  3. Automatic corruption detection and user notification
  4. Backup restoration capabilities
- **IMPLEMENTATION PLAN**: Modular file architecture to separate concerns and reduce edit risks
- **STATUS**: Solution designed and ready for implementation to eliminate recurring authentication issues permanently

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
- **Enhanced Player Management UI**: Modern visual design with gradient cards, smooth animations, and professional styling
- **Comprehensive Player Editing**: Full modal-based editing system for all player profile aspects
- **Streamlined Interface**: Removed outdated "Practice Excuse Statistics" section to focus on core player management
- **Individual Food Ordering System**: Completely redesigned food orders from group-based to individual player orders
- **Personal Budget Limits**: Each player has €35.00 maximum budget with real-time tracking and validation
- **Delivery Deadline Management**: Monday 12:00 AM deadline for Tuesday delivery, Thursday 12:00 AM for Friday delivery
- **Private Order History**: Players can only view and manage their own orders, ensuring privacy
- **Smart Deadline Logic**: Proper deadline checking allows Friday orders until Thursday midnight
- **Admin House Summary Feature**: Added visually appealing admin-only house grouping view with professional styling
- **Enhanced Visual Design**: Implemented gradient backgrounds, smooth animations, hover effects, and emojis for better UX
- **House-Based Order Management**: Admins can view consolidated shopping lists and totals grouped by player residence
- **System Recovery (July 30, 2025)**: Restored stable backup after WhatsApp communications integration caused authentication regression
- **Authentication Stability**: Maintained working login system with "Forgot Password" functionality and proper user credentials


The application follows a monorepo structure with clear separation between client and server code, shared type definitions, and comprehensive tooling for development and deployment.

## Integration Safety Protocols
Based on recurring authentication failures, comprehensive safety measures are now in place:

### Authentication Protection System
- **Authentication Safety Protocol**: See `AUTH_SAFETY_PROTOCOL.md` for mandatory procedures before any changes
- **Protected Authentication Backup**: `fc-koln-auth-stable.js` contains critical authentication functions for emergency restoration
- **Automated Backup System**: Authentication backups created automatically before modifications
- **Function Scope Protection**: Critical authentication functions made globally accessible (window.showAuthTab, window.showForgotPassword, window.logout)
- **Element ID Validation**: Mandatory verification of authentication HTML element structure
- **CSS Isolation**: Authentication styles protected from feature addition conflicts

### Legacy Integration Protocols
- **Stable backup maintained**: `fc-koln-7300-stable-backup.js` contains the working 7300-line application
- **Integration guidelines documented**: See `INTEGRATION_GUIDELINES.md` for safe external integration practices
- **Testing protocol established**: JavaScript syntax validation, browser console checks, and authentication testing required after any modifications
- **Emergency recovery procedure**: Copy from stable backup and apply minimal function accessibility fixes if integration issues occur

### Mandatory Testing Requirements
- Authentication functionality testing after every change
- Browser console error monitoring
- Element ID and function accessibility verification
- CSS style inheritance validation