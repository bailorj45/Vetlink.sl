# VetLink Sierra Leone

A comprehensive digital platform connecting farmers with certified veterinarians, enabling livestock health management, AI-assisted disease guidance, and educational resources for the agricultural community in Sierra Leone.

## 🌟 Features

### For Farmers
- **Veterinarian Directory**: Search and filter certified veterinarians by district, specialization, and availability
- **Appointment Booking**: Book, reschedule, and manage veterinary appointments
- **Livestock Management**: Track health records, medical history, and livestock information
- **AI Symptom Checker**: Get AI-powered guidance on livestock health symptoms
- **AI Feed Calculator**: Calculate personalized feeding recommendations
- **Breeding Tracker**: Monitor breeding cycles and expected delivery dates
- **Learning Hub**: Access educational resources and audio lessons
- **Disease Alerts**: Stay informed about disease outbreaks in your area
- **Emergency SOS**: Quick access to emergency veterinary services

### For Veterinarians
- **Professional Profile**: Create and manage your veterinary profile
- **Appointment Management**: Accept, decline, and manage appointment requests
- **Verification System**: Get verified by administrators
- **Farmer Network**: Connect with farmers in your district

### For Administrators
- **Veterinarian Verification**: Review and verify veterinarian credentials
- **User Management**: Manage all platform users
- **Disease Alerts**: Create and manage disease outbreak alerts
- **Analytics Dashboard**: View platform statistics and insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vetlink-sierra-leone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**
   
   Create the following tables in your Supabase database:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT UNIQUE NOT NULL,
     full_name TEXT NOT NULL,
     phone TEXT,
     role TEXT NOT NULL CHECK (role IN ('farmer', 'vet', 'admin')),
     farm_size TEXT,
     livestock_categories TEXT[],
     district TEXT,
     address TEXT,
     license_number TEXT,
     specialization TEXT,
     years_of_experience INTEGER,
     bio TEXT,
     verified BOOLEAN DEFAULT FALSE,
     availability TEXT DEFAULT 'available',
     rating DECIMAL(3,2),
     total_appointments INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Livestock table
   CREATE TABLE livestock (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     species TEXT NOT NULL,
     breed TEXT,
     age TEXT NOT NULL,
     gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
     weight TEXT,
     color TEXT,
     tag_number TEXT,
     date_of_birth DATE,
     purchase_date DATE,
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Appointments table
   CREATE TABLE appointments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
     vet_id UUID REFERENCES users(id) ON DELETE CASCADE,
     livestock_id UUID REFERENCES livestock(id) ON DELETE SET NULL,
     date DATE NOT NULL,
     time TIME NOT NULL,
     reason TEXT NOT NULL,
     urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Health records table
   CREATE TABLE health_records (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     livestock_id UUID REFERENCES livestock(id) ON DELETE CASCADE,
     date DATE NOT NULL,
     vet_id UUID REFERENCES users(id) ON DELETE SET NULL,
     diagnosis TEXT NOT NULL,
     treatment TEXT,
     medication TEXT,
     notes TEXT,
     temperature TEXT,
     weight TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Breeding records table
   CREATE TABLE breeding_records (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
     livestock_id UUID REFERENCES livestock(id) ON DELETE CASCADE,
     breeding_date DATE NOT NULL,
     expected_delivery_date DATE,
     delivery_date DATE,
     sire_id TEXT,
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Disease alerts table
   CREATE TABLE disease_alerts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
     affected_species TEXT[],
     affected_districts TEXT[],
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Emergency requests table
   CREATE TABLE emergency_requests (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     farmer_id UUID REFERENCES users(id) ON DELETE SET NULL,
     name TEXT NOT NULL,
     phone TEXT NOT NULL,
     location TEXT NOT NULL,
     species TEXT NOT NULL,
     urgency TEXT CHECK (urgency IN ('high', 'emergency')),
     description TEXT NOT NULL,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/app
  /farmer              # Farmer-specific pages
    /dashboard         # Farmer dashboard
    /livestock         # Livestock management
    /appointments      # Appointment management
    /ai-symptom-checker # AI symptom checker
    /feed-calculator   # Feed calculator
    /breeding          # Breeding tracker
  /vet                 # Veterinarian-specific pages
    /dashboard        # Vet dashboard
    /appointments     # Appointment management
    /requests         # Appointment requests
  /admin               # Admin-specific pages
    /dashboard        # Admin dashboard
    /verifications    # Vet verification
    /users            # User management
    /alerts           # Disease alerts management
  /auth                # Authentication pages
    /login            # Login page
    /register         # Registration page
  /vet-directory       # Vet directory/search
  /learning-hub        # Educational resources
  /newsfeed            # Disease alerts and news
  /sos                 # Emergency SOS page
  /about               # About page
  page.tsx             # Landing page

/components
  /ui                 # Reusable UI components
    Button.tsx
    Input.tsx
    Card.tsx
    Modal.tsx
    Badge.tsx
    AudioPlayer.tsx
    ...
  /cards              # Card components
    VetCard.tsx
    AppointmentCard.tsx
    StatsCard.tsx
  Navbar.tsx          # Navigation bar
  Sidebar.tsx         # Dashboard sidebar
  AlertBanner.tsx     # Disease alert banner

/lib
  /supabase           # Supabase client configuration
  /validators         # Form validation schemas
  /ai                 # AI features
    symptom-checker.ts
    feed-calculator.ts
  types.ts            # TypeScript type definitions

/utils
  cn.ts               # Utility functions

/styles
  globals.css         # Global styles and Tailwind config
```

## 🎨 Design System

### Colors
- **Primary Green**: `#1A5D1A` - Main brand color
- **Secondary Brown**: `#8B5E3C` - Accent color
- **Cream**: `#F8F5F0` - Background color
- **Accent Gold**: `#D4A017` - Highlight color
- **Error Red**: `#DC2626` - Error states

### Typography
- **Headings**: Inter (Bold, sans-serif)
- **Body**: Inter (Regular, sans-serif)
- **Hierarchy**: H1 → H6 with clear size progression

### Spacing
- 8px base spacing system
- Consistent padding and margins using multiples of 8px

### Components
- Rounded corners: 8px, 12px, 16px
- Soft shadows for depth
- Smooth transitions and hover effects

## 🔑 Key Functionality

### AI Symptom Checker
The AI symptom checker uses rule-based logic to analyze symptoms and provide:
- Possible conditions with confidence levels
- Urgency assessment
- Recommendations for care
- Guidance on when to consult a veterinarian

**Location**: `lib/ai/symptom-checker.ts`

### AI Feed Calculator
The feed calculator provides personalized feeding recommendations based on:
- Species and age
- Weight (optional)
- Purpose (meat, dairy, breeding, general)
- Pregnancy/lactation status

**Location**: `lib/ai/feed-calculator.ts`

### Appointment Flow
1. Farmer searches for veterinarians
2. Farmer books an appointment with date, time, and reason
3. Veterinarian receives notification
4. Veterinarian accepts or declines
5. If accepted, appointment is confirmed
6. After completion, appointment status is updated

### Disease Alerts Flow
1. Administrators create disease alerts
2. Alerts are displayed in the newsfeed
3. Farmers see alerts relevant to their livestock species and district
4. Critical alerts are prominently displayed

### Role-Based Access
- **Farmers**: Access to livestock management, appointments, AI tools, learning hub
- **Veterinarians**: Access to appointment management, profile, verification status
- **Admins**: Access to user management, vet verification, alerts management

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📝 Environment Variables

Required environment variables (in `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📚 Additional Documentation

### Database Schema
See the SQL schema in the installation section above.

### API Routes
The app uses Supabase client-side queries. No custom API routes are needed.

### Authentication
Authentication is handled by Supabase Auth with email/password.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@vetlink-sl.com or create an issue in the repository.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Payment integration for appointments
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Integration with government livestock databases
- [ ] Offline mode support

---

Built with ❤️ for Sierra Leone's agricultural community

