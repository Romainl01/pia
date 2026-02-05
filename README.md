# Memo

**Your personal relationship manager.**

In our busy lives, meaningful relationships often take a backseat. Memo helps you stay connected with the people who matter — whether they're family, close friends, colleagues, or a situationship.

Never forget a birthday, miss a catch-up, or lose track of conversations. Smart reminders keep you engaged, while a unique journaling feature helps you capture shared moments and create a meaningful year-end rewind of your relationships.

## Vision

With daily journaling, you can write about your day and mention people to anchor memories with those you share them with — strengthening bonds over time.

Memo helps you reach out at the right moment, with the right words.

**It's not just about staying in touch — it's about building relationships that last.**

## MVP Features

- **Contacts** — Add and manage contacts with name, photo, birthday, notes, and desired contact frequency
- **Smart Reminders** — Push notifications based on your set frequency for each contact
- **Catch-ups** — Log interactions and meaningful moments with your contacts
- **Journal** — Daily entries with the ability to mention and tag contacts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo (managed workflow) |
| Platform | iOS first, Android compatible |
| UI | Hero UI + Liquid Glass components |
| Backend | Supabase (auth, database, storage) |
| Auth | Apple Sign In |
| Payments | RevenueCat + Stripe |
| Paywall | Superwall |
| Analytics | PostHog |
| Notifications | Expo Notifications |

## Design Philosophy

Minimalist, modern, warm. Lovable yet pragmatic.

## Project Structure

```
memo/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── lib/                    # Utilities and configurations
│   ├── supabase/          # Supabase client and helpers
│   ├── notifications/     # Expo Notifications setup
│   └── analytics/         # PostHog integration
├── hooks/                  # Custom React hooks
├── stores/                 # State management
├── types/                  # TypeScript definitions
├── assets/                 # Images, fonts, etc.
└── docs/                   # Architecture and documentation
```

## Getting Started

See [docs/setup.md](docs/setup.md) for detailed setup instructions.

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios
```

## Documentation

- [Setup Guide](docs/setup.md)
- [Architecture Decisions](docs/architecture.md)
- [Database Schema](docs/database.md)
- [Feature Specs](docs/features.md)

## License

Private — All rights reserved.
