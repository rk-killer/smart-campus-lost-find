# Quick Start Guide

Get your Smart Campus Lost & Found System running in 5 minutes!

## TL;DR - Fastest Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
echo "VITE_SUPABASE_URL=your_url_here" > .env
echo "VITE_SUPABASE_ANON_KEY=your_key_here" >> .env

# 3. Run the app
npm run dev
```

Then set up your Supabase database (see below).

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free) - [Sign up here](https://supabase.com)

## Step-by-Step (5 Minutes)

### 1. Get Supabase Credentials (2 minutes)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in: Name, Password, Region
4. Wait for project creation (1-2 minutes)
5. Go to Settings > API
6. Copy:
   - **Project URL**
   - **anon public key**

### 2. Configure Your App (30 seconds)

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```

Paste your actual values!

### 3. Set Up Database (2 minutes)

1. Go to Supabase Dashboard > SQL Editor
2. Click "New query"
3. Copy ALL the SQL from `SETUP.md` (Section 5)
4. Click "Run"
5. Wait for "Success" message

### 4. Start the App (10 seconds)

```bash
npm run dev
```

Open browser to `http://localhost:5173` 🎉

## Quick Test

### Test the app in 2 minutes:

1. **Sign Up** (30 seconds)
   - Click "Sign Up"
   - Enter: name, email, password
   - Click "Sign Up"

2. **Report a Lost Item** (30 seconds)
   - Click "Report Item"
   - Choose "I Lost Something"
   - Fill in:
     - Item: "iPhone 13 Pro"
     - Category: Electronics
     - Description: "Black iPhone with cracked screen"
     - Location: Library
     - Date: Today
   - Submit

3. **Report a Found Item** (30 seconds)
   - Click "Report Item" again
   - Choose "I Found Something"
   - Fill in:
     - Item: "iPhone"
     - Category: Electronics
     - Description: "Black smartphone with damaged screen"
     - Location: Library
     - Date: Today
   - Submit

4. **Check for Match** (30 seconds)
   - Go to "My Items"
   - You should see a blue "Potential Matches Found!" box
   - Match score should be 70-80%

## Common Issues

### "Invalid API key"
→ Check your `.env` file has correct Supabase URL and key
→ Restart dev server: `Ctrl+C` then `npm run dev`

### "relation does not exist"
→ You didn't run the database migration
→ Go to Supabase Dashboard > SQL Editor and run the migration

### Nothing shows up
→ Did you sign up/login?
→ Check browser console for errors (F12)

### Images not uploading
→ Storage bucket needs to be created
→ See SETUP.md for storage configuration

## Next Steps

Now that it's running:

1. ✅ Customize campus locations (in `ReportItem.tsx`)
2. ✅ Test the search functionality
3. ✅ Try the notification system
4. ✅ Customize colors and branding
5. ✅ Add your college name

## Important Files

| File | What it does |
|------|--------------|
| `.env` | Your Supabase credentials |
| `src/App.tsx` | Main app component |
| `src/components/` | All UI components |
| `README.md` | Full documentation |
| `SETUP.md` | Detailed setup guide |

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Check for code issues
```

## Project Structure

```
src/
├── components/
│   ├── Auth/          # Login & Signup
│   ├── Dashboard/     # Main dashboard
│   ├── Items/         # Report items
│   ├── Search/        # Search functionality
│   ├── MyItems/       # User's items
│   └── Notifications/ # Notification center
├── contexts/
│   └── AuthContext    # Authentication state
└── lib/
    └── supabase.ts    # Database client
```

## Features to Demo

For your hackathon presentation, showcase:

1. **Easy Reporting**: How quick it is to report items
2. **Smart Matching**: How the system finds matches automatically
3. **Real-time Updates**: Notifications when matches are found
4. **Search**: Finding items by keyword and category
5. **Dashboard**: Clean overview of all items
6. **Mobile Responsive**: Show it works on phones

## Customization Ideas

Quick wins to make it yours:

```typescript
// 1. Change colors (src/components/)
className="bg-blue-600"  // Change to your school color

// 2. Add more locations (src/components/Items/ReportItem.tsx)
const CAMPUS_LOCATIONS = [
  'Your Building Name',
  'Another Location',
  // ...
];

// 3. Add more categories
const CATEGORIES = [
  'Your Category',
  // ...
];

// 4. Change branding (src/components/Layout/Header.tsx)
<span>Your College Name - Lost & Found</span>
```

## Production Deployment

Deploy for free on Vercel:

```bash
npm run build
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard!

## Getting Help

- 📖 Full docs: `README.md`
- 🔧 Setup issues: `SETUP.md`
- 🔥 Firebase comparison: `FIREBASE_VS_SUPABASE.md`
- 💬 Questions: Open a GitHub issue

## Success Checklist

Before your demo/submission:

- [ ] App runs without errors
- [ ] Can sign up / login
- [ ] Can report lost items
- [ ] Can report found items
- [ ] Search works
- [ ] Matching creates notifications
- [ ] Images can be uploaded
- [ ] Responsive on mobile
- [ ] Customized for your campus

## Time to Build: 30 minutes
**Setup**: 5 minutes
**Customization**: 15 minutes
**Testing**: 10 minutes

You're ready to go! 🚀

---

**Pro Tip**: Run through the entire flow yourself before demoing. Test on both desktop and mobile!
