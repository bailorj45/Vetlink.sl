# VetLink Sierra Leone - Project Explanation

## Overview

VetLink Sierra Leone is a comprehensive full-stack web application designed to bridge the gap between farmers and veterinarians in Sierra Leone. The platform provides digital tools for livestock health management, veterinary services, and agricultural education.

## Architecture

### Technology Stack
- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Project Structure

```
vetlink-sierra-leone/
├── app/                    # Next.js App Router pages
│   ├── farmer/            # Farmer-specific routes
│   ├── vet/               # Veterinarian-specific routes
│   ├── admin/             # Admin-specific routes
│   ├── auth/              # Authentication pages
│   └── [public pages]     # Public pages (landing, about, etc.)
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── cards/            # Card components
│   └── [layout components] # Navbar, Sidebar, etc.
├── lib/                  # Core libraries and utilities
│   ├── supabase/         # Supabase client configuration
│   ├── validators/       # Form validation schemas
│   ├── ai/               # AI feature implementations
│   └── types.ts          # TypeScript type definitions
└── utils/                # Utility functions
```

## Data Flow

### Authentication Flow
1. User registers (farmer or vet) → Supabase Auth creates account
2. User profile created in `users` table with role
3. Session stored in Supabase Auth
4. Protected routes check authentication via Supabase client
5. Role-based routing redirects to appropriate dashboard

### Appointment Flow
1. **Farmer searches** for veterinarians in directory
2. **Farmer books** appointment → Creates record in `appointments` table
3. **Vet receives** notification (in real app, would use Supabase Realtime)
4. **Vet accepts/declines** → Updates appointment status
5. **Appointment confirmed** → Both parties can view details
6. **After visit** → Vet marks as completed

### Livestock Management Flow
1. **Farmer adds** livestock → Creates record in `livestock` table
2. **Health records** linked to livestock via `livestock_id`
3. **Breeding records** track breeding cycles and expected deliveries
4. **AI tools** use livestock data for recommendations

### Disease Alert Flow
1. **Admin creates** alert → Inserts into `disease_alerts` table
2. **Alerts displayed** in newsfeed
3. **Farmers see** alerts relevant to their livestock species/district
4. **Critical alerts** prominently displayed

## Role-Based Access Control

### Farmer Role
- **Access**: Dashboard, livestock management, appointments, AI tools, learning hub
- **Can**: Book appointments, add livestock, use AI tools, view alerts
- **Cannot**: Verify vets, create alerts, manage users

### Veterinarian Role
- **Access**: Dashboard, appointment requests, profile
- **Can**: Accept/decline appointments, view farmer requests, manage profile
- **Cannot**: Access admin features, verify other vets

### Admin Role
- **Access**: Dashboard, vet verification, user management, alerts management
- **Can**: Verify vets, create alerts, view all users, manage platform
- **Cannot**: Book appointments as farmer, accept appointments as vet

## Key Features Implementation

### 1. AI Symptom Checker (`lib/ai/symptom-checker.ts`)
- **Type**: Rule-based expert system
- **Input**: Species, symptoms, age, duration, severity
- **Output**: Possible conditions, confidence levels, recommendations, urgency
- **Logic**: Matches symptoms against database of known conditions per species
- **Future**: Can be replaced with ML model for more accurate predictions

### 2. AI Feed Calculator (`lib/ai/feed-calculator.ts`)
- **Type**: Rule-based calculation engine
- **Input**: Species, age, weight, gender, purpose, pregnancy status
- **Output**: Daily feed amount, feeding schedule, water requirements, supplements
- **Logic**: Uses species-specific feed databases with adjustments for weight/purpose
- **Future**: Can integrate with nutritional databases for more precision

### 3. Vet Directory Search
- **Filters**: District, specialization, availability, name search
- **Display**: Cards with vet info, ratings, verification status
- **Booking**: Modal form to book appointment directly from directory

### 4. Breeding Tracker
- **Tracks**: Breeding date, expected delivery, actual delivery
- **Calculates**: Expected delivery based on species gestation period
- **Displays**: Visual indicators for pending vs. completed deliveries

### 5. Learning Hub
- **Content**: Educational lessons with audio support
- **Features**: Search, category filtering, audio player
- **Future**: Can integrate with CMS for dynamic content management

## Database Schema Relationships

```
users (1) ──< (many) livestock
users (1) ──< (many) appointments (farmer)
users (1) ──< (many) appointments (vet)
livestock (1) ──< (many) health_records
livestock (1) ──< (many) breeding_records
users (1) ──< (many) breeding_records (farmer)
```

## Component Architecture

### Reusable Components
- **Button**: Multiple variants (primary, secondary, accent, outline, ghost)
- **Input/Textarea/Select**: Form inputs with validation support
- **Card**: Container component with consistent styling
- **Modal**: Overlay modal for forms and details
- **Badge**: Status indicators with color variants
- **AudioPlayer**: Audio playback component for learning hub

### Feature Components
- **VetCard**: Displays veterinarian information
- **AppointmentCard**: Shows appointment details with actions
- **StatsCard**: Dashboard statistics display
- **AlertBanner**: Disease alert display component

### Layout Components
- **Navbar**: Main navigation with role-aware links
- **Sidebar**: Dashboard sidebar with role-specific menu items

## Styling System

### Design Tokens
- **Colors**: Primary green, secondary brown, cream background, accent gold
- **Spacing**: 8px base unit system
- **Typography**: Inter for headings, clean hierarchy
- **Shadows**: Soft, medium, large variants
- **Border Radius**: 8px, 12px, 16px

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts adapt to screen size
- Navigation collapses to mobile menu

## Security Considerations

1. **Authentication**: Supabase Auth handles secure authentication
2. **Authorization**: Role-based access control at route level
3. **Data Validation**: Zod schemas validate all form inputs
4. **SQL Injection**: Supabase client handles parameterized queries
5. **XSS Protection**: React automatically escapes content

## Performance Optimizations

1. **Code Splitting**: Next.js automatically splits code by route
2. **Image Optimization**: Next.js Image component (when images added)
3. **Lazy Loading**: Components load on demand
4. **Database Indexing**: Should add indexes on frequently queried fields

## Future Enhancements

1. **Real-time Updates**: Supabase Realtime for live notifications
2. **SMS Integration**: Twilio for appointment reminders
3. **Payment Gateway**: Stripe/Paystack for appointment payments
4. **Mobile App**: React Native version
5. **Offline Support**: Service workers for offline functionality
6. **Advanced Analytics**: Dashboard analytics for admins
7. **Multi-language**: i18n support for local languages
8. **AI Improvements**: ML models for symptom checker and feed calculator

## Deployment Considerations

1. **Environment Variables**: All sensitive keys in `.env.local`
2. **Database Migrations**: Use Supabase migrations for schema changes
3. **Error Handling**: Comprehensive error boundaries and user feedback
4. **Monitoring**: Integrate error tracking (Sentry, etc.)
5. **Backup**: Regular database backups via Supabase

## Testing Strategy (Future)

1. **Unit Tests**: Jest for utility functions and AI logic
2. **Component Tests**: React Testing Library for UI components
3. **Integration Tests**: Test user flows end-to-end
4. **E2E Tests**: Playwright/Cypress for critical paths

## Maintenance

1. **Dependencies**: Regular updates via `npm audit`
2. **Database**: Monitor query performance, optimize slow queries
3. **Security**: Regular security audits and dependency updates
4. **User Feedback**: Collect and implement user suggestions

---

This architecture provides a solid foundation for a scalable, maintainable platform that can grow with the needs of Sierra Leone's agricultural community.

