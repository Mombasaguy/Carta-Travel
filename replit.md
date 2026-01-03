# replit.md - Carta Travel Requirements

## Overview

Carta Travel is an employee travel requirements application with static country browser and interactive trip planning flow. Features a rules-based system matching trip inputs (destination, dates, purpose="BUSINESS", citizenship) against visa/entry requirements with strict governance validation. Provides Carta corporate policy guidance and generates formal invitation letters.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming (light/dark mode)
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with React plugin

The frontend follows a page-based structure with reusable components:
- Pages: Home, Country Detail, Search, Destinations, Trip Flow, Assess, Map, Not Found
- Core components: CountryCard, RequirementCard, HeroSection, SearchInput, NotificationBell
- Trip components: TripInputForm, ResultsStack (with governance display)
- UI components from shadcn/ui for consistent design patterns

### Real-time Notifications
- **WebSocket Server**: Real-time push notifications via `/ws` endpoint
- **Notification Types**: POLICY_CHANGE, TRAVEL_ADVISORY, SYSTEM_ANNOUNCEMENT, RULE_UPDATE
- **Severity Levels**: info, warning, critical
- **UI Component**: NotificationBell in header with badge count and dropdown panel
- **Features**: Mark as read, mark all as read, auto-refresh, WebSocket reconnection

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful JSON API with `/api` prefix
- **Development**: Vite middleware integration for HMR during development

API endpoints:
- `GET /api/countries` - List all countries
- `GET /api/countries/:id` - Get detailed country requirements
- `GET /api/search?q=` - Search countries by name/code
- `GET /api/trip/countries` - Get countries available for trip planning
- `POST /api/trip/resolve` - Resolve trip requirements based on input
- `POST /api/letters/generate` - Generate invitation letter content
- `POST /api/letters/download` - Download invitation letter as file
- `GET /api/map?passport=XX` - Get visa requirement colors for world map
- `GET /api/notifications` - Get all notifications with unread count
- `POST /api/notifications` - Create new notification (broadcasts via WebSocket)
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read
- `GET /api/config/mapbox` - Get Mapbox token for map visualization

### Rules Engine
- **Location**: `server/rules-engine.ts` with rules in `server/rules.json`
- **Schema**: Strict Zod validation with DateString regex, literal "BUSINESS" purpose
- **Citizenship Matching**: Rules match citizenship groups (VWP, EU, etc.)
- **Entry Types**: VISA, ETA, EVISA, NONE, UNKNOWN
- **Governance**: Each rule has owner, review_due_at, status (VERIFIED/NEEDS_REVIEW)
- **Sources**: Verified source references with verification dates

### Data Storage
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect
- **Current Implementation**: In-memory storage (MemStorage class) with mock data
- **Rules Data**: JSON file with travel rules and Carta policy

### Carta Policy Integration
The application integrates authentic Carta Global Travel Policy:
- Booking guidance (Navan, manager approval)
- Approval workflow (21/35 day advance booking, executive approval for <14 days)
- Expense policy (hotel rates by city, flight class restrictions)
- Travel insurance information
- Flight policy details
- Meal allowance by city
- Ground transportation (Lyft/Uber, Enterprise/National)
- Visa and passport guidance
- Invitation letter guidelines

### Letter Generation
- **Location**: `server/letter-generator.ts`
- **Templates**: US, UK, CA, BR, DE, JP
- **Format**: Official Carta business invitation letter format
- **Placeholders**: employeeName, employeeEmail, employeeTitle, citizenship, dates

### Design System
The application uses a hybrid design approach combining government portal clarity with modern travel platform aesthetics:
- Inter font family for UI elements
- CSS custom properties for theme tokens
- Consistent spacing using Tailwind's 4/6/8/12/16 unit system
- Card-based layouts with hover elevation effects
- Status badges for visa requirements (Visa Free, Visa Required, e-Visa, ETA, etc.)
- Dark mode support

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm** + **drizzle-zod**: Database ORM with Zod schema validation
- **wouter**: Client-side routing
- **zod**: Runtime type validation
- **framer-motion**: Animation library

### UI Framework
- **Radix UI**: Complete primitive component set (accordion, dialog, popover, etc.)
- **shadcn/ui**: Pre-styled component library
- **class-variance-authority**: Component variant management
- **tailwind-merge** + **clsx**: Utility class composition
- **lucide-react**: Icon library

### Document Generation
- **docxtemplater**: Document templating
- **pizzip**: ZIP file handling for DOCX

### Build and Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Database (when provisioned)
- **PostgreSQL**: Primary database
- **connect-pg-simple**: Session storage for PostgreSQL
- Database URL expected via `DATABASE_URL` environment variable

## Recent Changes

- 2026-01-03: Implemented hybrid visa data architecture: curated static data for map colors (fast, reliable), Travel Buddy API for individual assessments with curated fallback
- 2026-01-03: Added real-time notifications with WebSocket support for policy changes and travel advisories
- 2026-01-03: Added interactive world map (/map) with Mapbox showing visa requirements by passport
- 2026-01-03: Added NotificationBell component with unread count badge and dropdown panel
- 2025-07-28: Integrated authentic Carta Global Travel Policy
- 2025-07-28: Added official business invitation letter templates (US, UK, CA, BR, DE, JP)
- 2025-07-28: Implemented strict schema validation with DateString regex and literal BUSINESS purpose
- 2025-07-28: Added UK ETA guidance from official Carta policy documents
- 2025-07-28: Enhanced governance tracking with sources and verification dates
