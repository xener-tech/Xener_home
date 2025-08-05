# Xener Home - Smart Energy Tracker & Saver


## Overview

Xener Home is a comprehensive smart energy tracking and management web application that helps users monitor household electricity usage and receive AI-powered energy-saving recommendations. Built with a "Fitbit for smart energy homes" design philosophy, the app features a clean, minimalistic white background with gradient blue-purple accents.

## ✨ Key Features

### 🏠 **Smart Energy Dashboard**
- Real-time energy efficiency scoring (0-100%)
- Today's usage and cost tracking
- Visual energy consumption analytics
- Personalized performance insights

### ⚡ **Appliance Management**
- Complete household appliance inventory
- Power rating and efficiency tracking
- Star-based energy efficiency ratings
- Usage pattern analysis
- Icon-based visual categorization

### 📄 **Bill Processing & OCR**
- Upload electricity bills via camera or file
- Automatic data extraction using Tesseract.js OCR
- Manual data entry fallback
- Historical bill tracking and comparison
- Cost trend analysis

### 🤖 **AI-Powered Recommendations**
- OpenAI-generated personalized energy-saving tips
- Categorized recommendations (cooling, timing, home setup, ghost loads)
- Savings calculation and ROI estimates
- Bookmark favorite tips for easy access
- Smart scheduling suggestions

### 📊 **Analytics & Visualization**
- Interactive charts powered by Chart.js
- Monthly consumption trends
- Energy score progression tracking
- Top energy-consuming appliances
- Usage pattern insights

### 📱 **Mobile-First Design**
- Responsive design for all devices
- Clean minimalistic white theme
- Gradient blue-purple navigation icons
- Bottom navigation for easy mobile access
- Android APK generation with Capacitor

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **Tailwind CSS** with shadcn/ui components
- **Vite** for fast development and builds
- **TanStack Query** for server state management
- **Chart.js** for data visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout the stack
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** (Neon serverless compatible)
- **Express sessions** with PostgreSQL store

### External Services
- **Firebase Authentication** with Google OAuth
- **OpenAI API** for AI-powered recommendations
- **Tesseract.js** for OCR bill processing
- **Google Sheets API** for data export

### Mobile Development
- **Capacitor** for Android APK generation
- **Native mobile features** integration
- **App icons** and splash screens configured

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Firebase project (for authentication)
- OpenAI API key (for AI recommendations)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xener-tech/Xener_home.git
   cd Xener_home
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Web app: `http://localhost:5000`
   - The app will automatically open in your default browser

## 📱 Android APK Build

To generate an Android APK:

1. **Build the web app**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

4. **Build APK in Android Studio**
   - Go to Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Find the APK in `android/app/build/outputs/apk/debug/`

See [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md) for detailed instructions.

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express.js backend
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── android/               # Capacitor Android configuration
└── dist/                  # Production build output
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Database Schema
The application uses PostgreSQL with the following main tables:
- **Users** - User accounts with Firebase UID mapping
- **Appliances** - Household appliance specifications
- **Bills** - Electricity bills with OCR-extracted data
- **Usage Records** - Energy consumption tracking
- **AI Tips** - Generated energy-saving recommendations

## 🔐 Authentication

The app uses Firebase Authentication with Google OAuth:
1. Users sign in with their Google account
2. Firebase handles authentication securely
3. User data is synced with the internal database
4. Protected routes require authentication

## 🤖 AI Features

### Energy-Saving Tips
The AI system generates personalized recommendations based on:
- Appliance inventory and usage patterns
- Historical energy consumption
- Seasonal adjustments
- Home characteristics

### Tip Categories
- **Cooling & Heating** - HVAC optimization strategies
- **Timing** - Smart scheduling recommendations
- **Home Setup** - Physical arrangement improvements
- **Ghost Loads** - Standby power reduction

## 📊 Analytics

### Energy Efficiency Score
A comprehensive score (0-100%) calculated from:
- Appliance efficiency ratings
- Usage optimization
- Historical performance
- Comparative benchmarks

### Visualizations
- Daily/weekly/monthly consumption charts
- Appliance-wise usage breakdown
- Cost trend analysis
- Efficiency improvement tracking

## 🌐 Deployment

### Web Deployment
The application is optimized for deployment on:
- **Replit** (recommended for development)
- **Vercel** (for production)
- **Netlify** (alternative hosting)
- **Heroku** (with PostgreSQL add-on)

### Database
- **Development**: Local PostgreSQL or Neon serverless
- **Production**: Neon, Supabase, or managed PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Xener Tech

Xener Home is developed by **Xener Tech**, focused on creating innovative smart energy management solutions for modern homes. Our mission is to make energy efficiency accessible, engaging, and rewarding for every household.

## 📞 Support

For support, email support@xener-tech.com or join our community discussions.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/xener-tech">Xener Tech</a></p>
  <p>🌟 Star this repository if you found it helpful!</p>
</div>
