# Smart Campus Lost & Found System

A full-stack web application designed to help college students report, search, and match lost and found items on campus. Built with React, TypeScript, and Supabase.

## Features

### Core Functionality
- **User Authentication**: Secure email/password authentication using Supabase Auth
- **Report Lost Items**: Submit detailed reports of lost items with images, descriptions, and locations
- **Report Found Items**: Help others by reporting items you've found on campus
- **Smart Search**: Search for lost or found items by keywords and categories
- **Automatic Matching**: AI-powered matching system that finds potential matches between lost and found items
- **Real-time Notifications**: Get notified when potential matches are found
- **Dashboard**: View all recent lost and found items at a glance
- **My Items**: Manage your reported items and view match status
- **Image Upload**: Upload photos of items using Supabase Storage

### Technical Features
- Responsive design that works on mobile, tablet, and desktop
- Real-time updates using Supabase Realtime
- Secure Row Level Security (RLS) policies
- Clean, modern UI with Tailwind CSS
- Type-safe with TypeScript
- Edge Functions for serverless matching logic

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase
  - Authentication (Supabase Auth)
  - Database (PostgreSQL)
  - Storage (Supabase Storage)
  - Edge Functions (Deno)
  - Realtime (WebSockets)

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx           # Login form
│   │   └── Signup.tsx          # Signup form
│   ├── Dashboard/
│   │   └── Dashboard.tsx       # Main dashboard view
│   ├── Items/
│   │   └── ReportItem.tsx      # Form to report lost/found items
│   ├── Layout/
│   │   └── Header.tsx          # Navigation header
│   ├── MyItems/
│   │   └── MyItems.tsx         # User's items and matches
│   ├── Notifications/
│   │   └── Notifications.tsx   # Notification center
│   └── Search/
│       └── Search.tsx          # Search interface
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   └── supabase.ts            # Supabase client and types
├── App.tsx                     # Main app component
└── main.tsx                    # Entry point

supabase/
└── functions/
    └── find-matches/
        └── index.ts           # Matching algorithm edge function
```

## Database Schema

### Tables

**profiles**
- Stores user profile information
- Automatically created on signup
- Links to auth.users

**lost_items**
- Item name, category, description
- Location lost, date lost
- Image URL (optional)
- Status: pending, matched, closed

**found_items**
- Item name, category, description
- Location found, date found
- Image URL (optional)
- Status: pending, matched, closed

**matches**
- Links lost items to found items
- Match score (0-100)
- Match reason (explanation)
- Status: pending, confirmed, rejected

**notifications**
- User notifications
- Title, message, type
- Read status

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works fine)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd smart-campus-lost-found
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (2-3 minutes)
3. Once ready, go to Project Settings > API
4. Copy your project URL and anon/public key

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 5: Database Setup

The database migrations have already been created. You need to run them in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration files from your local setup
4. Execute the migrations in order

Alternatively, if you have the Supabase CLI:
```bash
npx supabase db push
```

### Step 6: Storage Setup

The storage bucket for images is automatically created by the migration. No additional setup needed.

### Step 7: Deploy Edge Functions

The matching edge function has been deployed. It will automatically find matches when items are reported.

### Step 8: Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 9: Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## How It Works

### Reporting an Item

1. Users sign up/login to the platform
2. Click "Report Item" button
3. Choose between "Lost" or "Found"
4. Fill in item details:
   - Item name
   - Category (Electronics, Clothing, Documents, etc.)
   - Description
   - Location
   - Date
   - Upload image (optional)
5. Submit the report

### Matching Algorithm

When an item is reported, the system automatically:

1. Compares it with all items in the opposite category (lost vs found)
2. Calculates a match score based on:
   - **Category Match** (40 points): Same category
   - **Name Similarity** (30 points): Similar item names
   - **Description Keywords** (up to 30 points): Common words in descriptions
   - **Date Proximity** (10 points): Items lost/found within 7 days
3. If match score ≥ 50%, creates a match record
4. Sends notifications to both item owners
5. Users can view matches in "My Items" section

### Search Functionality

- Search by keywords (searches in item name and description)
- Filter by category
- View lost or found items separately
- See all pending items on campus

### Notifications

- Real-time notifications when matches are found
- Badge counter on notification bell
- Mark as read/unread
- Delete notifications

## Categories

The system supports the following item categories:
- Electronics (phones, laptops, headphones, etc.)
- Clothing (jackets, bags, hats, etc.)
- Documents (ID cards, certificates, papers)
- Accessories (jewelry, watches, glasses)
- Books (textbooks, notebooks)
- Keys (room keys, car keys)
- Other (anything else)

## Campus Locations

Predefined locations for easy reporting:
- Library
- Student Center
- Cafeteria
- Gym
- Parking Lot
- Lecture Halls
- Lab Building
- Dormitory
- Sports Field
- Main Gate
- Other

## Security Features

### Row Level Security (RLS)
- Users can only edit/delete their own items
- All users can view lost and found items (for search)
- Matches only visible to relevant item owners
- Notifications only visible to the recipient

### Storage Security
- Only authenticated users can upload images
- Images are stored in a public bucket for easy viewing
- Users can only delete their own images

### Authentication
- Secure password-based authentication
- Email verification can be enabled
- Protected routes require login

## Future Enhancements

Some ideas for extending this project:

### Google Vision API Integration
To add visual similarity matching:

1. Sign up for Google Cloud Platform
2. Enable Vision API
3. Add API key to environment variables
4. Update the matching edge function to:
   - Send images to Vision API
   - Get labels/features
   - Compare visual similarity
   - Increase match score for similar images

Example integration:
```typescript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();
const [result] = await client.labelDetection(imageUrl);
const labels = result.labelAnnotations;
```

### Email Notifications
- Configure SMTP in Supabase
- Send email when matches are found
- Weekly digest of activity

### Admin Dashboard
- Moderate reported items
- View analytics
- Manage disputes

### Chat System
- Direct messaging between users
- Coordinate item pickup

### QR Code Generation
- Generate QR codes for items
- Easy mobile access

### Multi-Campus Support
- Support multiple campuses
- Filter by campus

## Contributing

This is a hackathon/college project. Feel free to fork and extend it for your needs!

## License

MIT License - feel free to use this for your college projects or hackathons.

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for college students everywhere
