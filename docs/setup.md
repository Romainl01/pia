# Setup Guide

Complete guide to setting up the Memo development environment.

## Prerequisites

- **Node.js** 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Simulator** (Xcode 15+ on macOS)
- **Expo Go** app on your physical device (optional)

## 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url> memo
cd memo

# Install dependencies
npm install
```

## 2. Environment Setup

Create a `.env` file in the project root:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_revenuecat_ios_key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_revenuecat_android_key

# PostHog
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Superwall
EXPO_PUBLIC_SUPERWALL_API_KEY=your_superwall_key
```

## 3. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key
3. Add them to your `.env` file

### Database Schema

Run the migrations in the Supabase SQL editor (see [database.md](database.md) for full schema):

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables (see database.md for complete schema)
```

### Enable Apple Sign In

1. In Supabase Dashboard → Authentication → Providers
2. Enable Apple provider
3. Configure with your Apple Developer credentials:
   - Services ID
   - Team ID
   - Key ID
   - Private Key (p8 file contents)

## 4. Apple Developer Setup

### Apple Sign In Configuration

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Create an App ID with Sign In with Apple capability
3. Create a Services ID for web auth
4. Create a Key for Sign In with Apple
5. Note the Team ID, Key ID, and download the .p8 key

### Push Notifications

1. Enable Push Notifications capability on your App ID
2. Create an APNs key or certificate
3. Configure in Expo/EAS dashboard

## 5. RevenueCat Setup

1. Create account at [revenuecat.com](https://revenuecat.com)
2. Create a new project
3. Add iOS app with your bundle identifier
4. Create entitlements and offerings
5. Add API keys to `.env`

## 6. PostHog Setup

1. Create account at [posthog.com](https://posthog.com)
2. Create a new project
3. Copy your API key and host URL to `.env`

## 7. Superwall Setup

1. Create account at [superwall.com](https://superwall.com)
2. Connect to RevenueCat
3. Create your first paywall
4. Add API key to `.env`

## Running the App

### Development Server

```bash
# Start Expo development server
npx expo start

# Options:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app
```

### iOS Simulator

```bash
# Run directly on iOS simulator
npx expo run:ios
```

### Development Build

For features requiring native code (notifications, Apple Sign In):

```bash
# Create development build
npx eas build --profile development --platform ios

# Install on simulator/device and run
npx expo start --dev-client
```

## Project Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm test
```

## Troubleshooting

### Common Issues

**Expo CLI not found**
```bash
npm install -g expo-cli
# or use npx expo instead
```

**iOS build fails**
- Ensure Xcode is installed and up to date
- Run `sudo xcode-select --switch /Applications/Xcode.app`

**Supabase connection issues**
- Check your `.env` file has correct values
- Ensure no trailing whitespace in env values
- Verify RLS policies allow your queries

**Push notifications not working**
- Development builds required for push notifications
- Check push token is being stored correctly
- Verify APNs configuration in Expo/EAS

### Getting Help

- Check Expo docs: [docs.expo.dev](https://docs.expo.dev)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Open an issue in the repository
