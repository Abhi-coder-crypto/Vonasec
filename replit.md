# MEGA CV - Surgical Infection Quiz

## Overview

This is a medical quiz application designed for surgeons to test their knowledge on surgical infection control and prevention. The application features a participant registration system, a multi-question quiz with both multiple choice and text-based questions, and an admin dashboard for viewing submissions.

The quiz covers topics including surgical site infection prevention, antibiotic prophylaxis, infection risk factors, and treatment protocols for various surgical infections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Animations**: Framer Motion for smooth transitions
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Validation**: Zod schemas shared between frontend and backend

### Data Storage
- **Database**: MongoDB (NoSQL document database)
- **Connection**: MongoDB Node.js driver with connection pooling
- **Collections**: `participants` and `submissions`

### Application Flow
1. Users register with name, email (Gmail only), and Indian phone number
2. Participant data stored in MongoDB with generated ObjectId
3. Quiz presents 14 questions (mix of MCQ and text-based)
4. Submissions linked to participant via participantId reference
5. Admin dashboard displays all submissions with participant details

### Key Design Decisions
- **MongoDB over PostgreSQL**: Document-based storage suits the flexible quiz answer structure where answers are stored as key-value pairs
- **Shared Schema**: Zod schemas in `/shared` directory ensure type safety across client and server
- **Session-less Auth**: Simple localStorage-based session for quiz participants; admin uses hardcoded credentials stored server-side
- **No ORM for MongoDB**: Direct MongoDB driver usage for simpler document operations

## External Dependencies

### Database
- **MongoDB**: Primary data store accessed via `MONGODB_URI` environment variable
- Database name: `megacv_quiz`

### Third-Party Services
- **Google Fonts**: Plus Jakarta Sans and Inter font families loaded from fonts.googleapis.com

### Key NPM Packages
- `mongodb`: MongoDB Node.js driver for database operations
- `zod`: Schema validation for API requests and form data
- `@tanstack/react-query`: Data fetching and caching
- `framer-motion`: Animation library
- `react-hook-form`: Form state management
- `wouter`: Lightweight routing

### Environment Variables Required
- `MONGODB_URI`: MongoDB connection string
- `ADMIN_USERNAME`: Admin login username (server-side)
- `ADMIN_PASSWORD`: Admin login password (server-side)

Note: The project includes Drizzle configuration for PostgreSQL but currently uses MongoDB. The Drizzle setup (`drizzle.config.ts`) references `DATABASE_URL` which is not used by the active MongoDB implementation.