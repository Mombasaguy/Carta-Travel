# replit.md - Carta Travel Requirements

## Overview

Carta Travel is a travel requirements information platform that helps users check visa requirements, entry regulations, and travel documentation for destinations worldwide. The application provides a clean, information-first interface for browsing country-specific travel requirements including visa policies, health regulations, customs restrictions, and stay limitations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming (light/dark mode)
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Build Tool**: Vite with React plugin

The frontend follows a page-based structure with reusable components:
- Pages: Home, Country Detail, Search, Destinations, Not Found
- Core components: CountryCard, RequirementCard, HeroSection, SearchInput
- UI components from shadcn/ui for consistent design patterns

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful JSON API with `/api` prefix
- **Development**: Vite middleware integration for HMR during development

API endpoints:
- `GET /api/countries` - List all countries
- `GET /api/countries/:id` - Get detailed country requirements
- `GET /api/search?q=` - Search countries by name/code

### Data Storage
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect
- **Current Implementation**: In-memory storage (MemStorage class) with mock data
- **Database Ready**: Drizzle config prepared for PostgreSQL when DATABASE_URL is provided

The storage layer uses an interface pattern (IStorage) allowing easy swapping between memory storage and database storage.

### Design System
The application uses a hybrid design approach combining government portal clarity with modern travel platform aesthetics:
- Inter font family for UI elements
- CSS custom properties for theme tokens
- Consistent spacing using Tailwind's 4/6/8/12/16 unit system
- Card-based layouts with hover elevation effects
- Status badges for visa requirements (Visa Free, Visa Required, e-Visa, etc.)

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm** + **drizzle-zod**: Database ORM with Zod schema validation
- **wouter**: Client-side routing
- **zod**: Runtime type validation

### UI Framework
- **Radix UI**: Complete primitive component set (accordion, dialog, popover, etc.)
- **shadcn/ui**: Pre-styled component library
- **class-variance-authority**: Component variant management
- **tailwind-merge** + **clsx**: Utility class composition
- **lucide-react**: Icon library

### Build and Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Database (when provisioned)
- **PostgreSQL**: Primary database
- **connect-pg-simple**: Session storage for PostgreSQL
- Database URL expected via `DATABASE_URL` environment variable