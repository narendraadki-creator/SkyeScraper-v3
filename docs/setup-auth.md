# Quick Authentication Setup Guide

## 🚀 **Quick Start**

### 1. **Configure Supabase**

1. **Copy environment file**:
   ```bash
   cp env.example .env
   ```

2. **Get Supabase credentials**:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy Project URL and anon/public key

3. **Update .env file**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2. **Start Development Server**

```bash
npm run dev
```

### 3. **Test Authentication**

1. **Go to**: `http://localhost:5173/register`
2. **Register** a new organization
3. **Login** with your credentials
4. **Verify** dashboard access

## 🧪 **Quick Test**

### Register Developer Organization:
- **Name**: Test Developer
- **Type**: Developer
- **Email**: test@example.com
- **Password**: password123

### Expected Results:
- ✅ Redirects to dashboard
- ✅ Shows organization info
- ✅ Displays admin role
- ✅ No console errors

## 🔧 **Troubleshooting**

### If registration fails:
1. Check Supabase URL/key in .env
2. Verify database migrations ran
3. Check browser console for errors

### If login fails:
1. Verify user was created in Supabase Auth
2. Check employee record exists
3. Verify RLS policies are enabled

## 📱 **Available Routes**

- `/` - Redirects to login or dashboard
- `/login` - Employee login page
- `/register` - Organization registration
- `/dashboard` - Protected dashboard (requires auth)

## 🎯 **Success Indicators**

- ✅ No console errors
- ✅ JWT token in localStorage
- ✅ User data loads in dashboard
- ✅ Role-based theming works
- ✅ Sign out clears auth state

The authentication system is ready for testing! 🚀
