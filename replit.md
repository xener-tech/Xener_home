# Xener Home - Smart Energy Tracker & Saver

## Overview

Xener Home is a comprehensive smart energy tracking and management web application built to help users monitor household electricity usage and receive AI-powered energy-saving recommendations. The application features real-time energy monitoring, appliance management, bill tracking with OCR capabilities, and personalized AI tips for optimizing energy consumption.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: TanStack Query for server state management
- **Authentication**: Firebase Authentication with Google OAuth

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Express sessions with PostgreSQL store
- **AI Integration**: OpenAI API for generating energy-saving tips

## Key Components

### Authentication System
- Firebase Authentication integration with custom backend user management
- Google OAuth for seamless login experience
- User data synchronization between Firebase and internal database
- Protected routes with authentication middleware

### Appliance Management
- CRUD operations for household appliances
- Detailed appliance specifications including power rating, age, and usage patterns
- Star rating system for energy efficiency
- Icon-based visual representation with FontAwesome icons

### Bill Processing & OCR
- Image upload functionality for electricity bills
- Tesseract.js OCR integration for automatic bill data extraction
- Manual data entry fallback for failed OCR attempts
- Historical bill tracking and analysis

### AI-Powered Tips System
- OpenAI integration for generating personalized energy-saving recommendations
- Categorized tips (cooling, timing, home setup, ghost loads)
- Savings calculation and ROI estimates
- Bookmark functionality for favorite tips

### Analytics & Visualization
- Chart.js integration for energy consumption visualization
- Energy score calculation and tracking
- Usage pattern analysis
- Monthly consumption trends

## Data Flow

1. **User Authentication**: Firebase handles authentication, backend creates/syncs user records
2. **Appliance Data**: Users input appliance details, stored in PostgreSQL via Drizzle ORM
3. **Bill Processing**: Images uploaded → OCR processing → data extraction → storage
4. **AI Tips Generation**: Appliance + usage data → OpenAI API → personalized recommendations
5. **Analytics**: Historical data aggregation → Chart.js visualization → user insights

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management
- **chart.js**: Data visualization
- **tesseract.js**: OCR functionality
- **firebase**: Authentication services
- **openai**: AI-powered tip generation

### UI Libraries
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development
- Vite development server with HMR
- Express server with middleware integration
- Environment-based configuration for Firebase and OpenAI

### Production Build
- Vite builds client-side React application
- ESBuild bundles server-side Express application
- Static assets served from Express server
- Database migrations via Drizzle Kit

### Environment Configuration
- Firebase project credentials via environment variables
- OpenAI API key for AI functionality
- Database URL for PostgreSQL connection
- Replit-specific optimizations for development environment

### Database Schema
- Users table with Firebase UID mapping
- Appliances table with detailed specifications
- Bills table with OCR-extracted data
- AI Tips table with categorized recommendations
- Usage Records table for consumption tracking

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and integration with external services for authentication, AI, and data persistence.

## Recent Changes

### APK Build Setup (January 2025)
- ✅ Configured Capacitor for Android app generation
- ✅ Added Android platform with app ID: com.xener.home
- ✅ Created custom gradient app icon
- ✅ Set up build scripts and configuration
- ✅ Generated complete build guide for APK compilation
- ✅ Ready for Android Studio compilation and Play Store distribution

### Design Transformation (January 2025)
- ✅ Completely redesigned with clean minimalistic white theme
- ✅ Applied "Fitbit for smart energy homes" design philosophy
- ✅ Updated bottom navigation to show only 4 essential options
- ✅ Implemented gradient icons with blue-purple color scheme
- ✅ Enhanced typography with proper contrast for visibility
- ✅ Transformed all cards and components to light backgrounds