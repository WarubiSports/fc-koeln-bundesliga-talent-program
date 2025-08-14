# FC Köln Management System

## Overview

This is a full-stack web application, rebranded as "1.FC Köln Bundesliga Talent Program," for managing FC Köln's international talent program. The system provides comprehensive player management, facility coordination, and administrative features for staff and players, with official FC Köln branding. It aims to streamline operations and enhance the management of young talent.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
- **Calendar System with Multi-View Support (August 14, 2025)**: Implemented comprehensive iCalendar system with professional functionality
  - Daily, weekly, and monthly view options with smooth view switching
  - Time-based event positioning in day/week views (6 AM - 10 PM time slots)
  - Color-coded events by type (training: green, matches: red, meetings: blue, facility: purple, medical: orange)
  - Professional calendar grid with FC Köln red branding and responsive design
  - Event creation modal with full details (title, type, location, description, date/time)
  - Event details viewer with formatted information display
  - Navigation controls that adapt to current view (day/week/month periods)
  - Mobile-optimized interface with touch-friendly controls
- **User Management System Complete (August 14, 2025)**: Successfully implemented comprehensive admin-only User Management functionality
  - Admin-only access control with pending applications approval/rejection system
  - Detailed application cards showing email, age, position/department, nationality, and notes
  - Existing user profile management with clean card-based interface
  - Manual house assignment system allowing admins to select houses based on multiple factors (personalities, training groups, mentor relationships)
  - House selection modal shows current occupancy to help with administrative decisions
  - Fixed critical JavaScript syntax errors in template literals using data attributes instead of inline onclick handlers
  - Implemented proper event delegation to prevent string escaping issues that disrupted authentication
- **Authentication System Stability (August 14, 2025)**: Resolved recurring JavaScript syntax errors permanently
  - Root cause identified: Malformed JavaScript from incomplete recurring events implementation
  - Fixed orphaned fetch statements and incomplete code blocks causing "Unexpected identifier 'fetch'" errors
  - Removed problematic recurring events code that was breaking frontend JavaScript execution
  - Authentication system restored by cleaning up syntax errors rather than modifying auth logic
  - Key lesson: Always target root cause (JavaScript syntax) rather than symptoms (login failures)
- **Household Items Budget Fix (August 12, 2025)**: Removed prices from household items and excluded them from €35 budget calculations
  - Set all household item prices to 0 (toilet paper, cleaning supplies, etc.)
  - Modified budget calculation to only count items with price > 0
  - Updated UI to show "Free" instead of prices for household items
  - Fixed CSV exports to properly handle free household items
- **Previous Stable System (August 5, 2025)**: Created `fc-koln-stable-permanent.js` with error prevention measures, but authentication errors still occurred due to syntax issues
- **All Original Features Restored**: Successfully implemented ALL comprehensive features including:
  - Dashboard with real-time statistics and player overview cards
  - Player management with house assignments (Widdersdorf 1, 2, 3)
  - Chore management with priority levels and deadlines
  - Unified calendar system with event scheduling
  - Individual food ordering with €35 budget limits per player
  - WhatsApp-style communications system with house group chats
  - Complete admin controls and role-based access
- **Technical Architecture**: Built on Express.js with REST API endpoints, robust JavaScript frontend using modern event delegation, and comprehensive data management

### Communication System Improvements (August 14, 2025)
- **Ultra-Spacious Interface Design**: Redesigned communications with 90vh height, expanded sidebar (420px), generous padding throughout
- **Enhanced Visual Hierarchy**: Larger fonts (1.75rem headers, 1.1rem chat names), improved spacing, modern gradients
- **Professional Animation System**: Smooth hover effects, scale animations, fadeIn transitions for messages
- **Luxury Spacing Standards**: 3rem padding for headers/messages, 2rem margins for chat items, 56px send button
- **30-Day Message Retention**: Implemented automatic cleanup of messages older than 30 days for storage efficiency and privacy compliance
- **Smart Cleanup System**: Daily cleanup check that runs once per session to maintain performance
- **User-Friendly Notification**: Added retention policy notice in communications UI
- **Group Chat Creation Fix**: Fixed visibility of Group Chat button alongside Direct Message option
- **Complete Messaging Functionality**: All core features working - persistence, real-time updates, search, mobile responsive
- **WhatsApp-Style Interface**: Clean message bubbles with FC Köln red theme and proper timestamps

### Previous Communication System Features (August 4, 2025)
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
    - Player management and status tracking with view-only interface (advanced features planned for future implementation)
    - Administrative dashboard with full admin controls (5 categories of system management).
    - Event scheduling and facility booking.
    - Notification system with email integration.
    - Individual grocery ordering system for players with budget limits and delivery deadlines.
    - Internal messaging system.
    - Chore management system for houses with deadlines and priority levels.
    - Security controls and emergency protocols.
- **Future Player Management Enhancements** (planned for later development phases):
    - Player photos/avatars and detailed profile information
    - Performance metrics and training analytics dashboard
    - Medical records and injury tracking system
    - Training attendance monitoring
    - Coach feedback and assessment tools
    - Advanced reporting and data export capabilities

### System Design Choices
- **Monorepo Structure**: Clear separation between client, server, and shared type definitions.
- **Authentication Stability**: A modular architecture with `auth-core.js` for immutable authentication functions, `features-module.js` for isolated feature functions, and `system-monitor.js` for continuous integrity checks and recovery. This includes non-writable, non-configurable function properties and multi-layered integrity verification.
- **Event Handling Architecture**: Uses data attributes with event delegation instead of inline onclick handlers to prevent JavaScript string escaping issues that can disrupt authentication systems.
- **Production Build**: Fixed production deployment to use `fc-koln-7300-working.js` instead of `app.js` to ensure deployed app matches development preview exactly (January 2025).
- **Configuration**: Environment variables for critical settings, separate configurations for development and production, and TypeScript path mapping.

## Design System & UI Standards (Established August 2025)

### Core Design Principles
1. **Luxury Spacing Philosophy**: Always prioritize generous whitespace over cramped layouts
2. **Progressive Enhancement**: Build mobile-first, then enhance for desktop with more space
3. **FC Köln Brand Consistency**: Official red (#dc143c) with modern slate grays (#1e293b, #64748b)
4. **Accessibility First**: High contrast ratios, large touch targets (min 56px), clear visual hierarchy

### Spacing Standards
- **Container Heights**: Use 90vh minimum for main interfaces, min-height 800px as fallback
- **Padding Scale**: 3rem for major sections, 2rem for content areas, 1.5rem for smaller elements
- **Font Scale**: 1.75rem+ for main headers, 1.1rem+ for important text, 0.9rem+ for body text
- **Button Sizing**: 56px minimum for primary actions, generous padding for all interactive elements

### Component Design Patterns
- **Cards**: 16-20px border radius, subtle shadows, hover animations with scale/transform
- **Forms**: Large input fields (1.125rem+ padding), focus states with brand color glow
- **Navigation**: Spacious sidebar layouts (380px+), clear visual separation
- **Messages**: Generous bubble padding (1rem+), proper sender/timestamp spacing

### Animation Guidelines
- **Micro-interactions**: Scale (1.05) on hover, smooth 0.2s transitions
- **Loading States**: fadeInUp animations for dynamic content
- **State Changes**: Color transitions, shadow adjustments, subtle transforms

### Responsive Breakpoints
- **Mobile**: Reduce padding to 1-1.5rem, maintain generous vertical spacing
- **Tablet**: Scale up spacing moderately
- **Desktop**: Full luxury spacing implementation

## Future Development Guidelines

### When Adding New Features
1. **Follow Established Spacing**: Use the luxury spacing standards documented above
2. **Maintain Visual Hierarchy**: Consistent font scales and color usage
3. **Preserve Authentication**: Never modify auth-core.js or system-monitor.js
4. **Test Mobile First**: Ensure spacious design works on all screen sizes
5. **Brand Consistency**: Use official FC Köln colors and maintain professional styling

### Quality Assurance Checklist
- [ ] Spacing matches established standards (3rem headers, 2rem content)
- [ ] Typography follows scale (1.75rem+ headers, appropriate body text)
- [ ] Animations are smooth and purposeful
- [ ] Mobile responsiveness maintained
- [ ] FC Köln branding consistent
- [ ] Authentication system untouched
- [ ] Performance considerations addressed

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