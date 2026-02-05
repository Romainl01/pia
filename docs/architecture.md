# Architecture Decisions

This document records the key architectural decisions for Memo and the reasoning behind them.

---

## ADR-001: React Native + Expo (Managed Workflow)

**Status:** Accepted
**Date:** 2025-01-10

### Context

We need a cross-platform mobile framework that allows rapid development while maintaining native performance and access to device APIs (notifications, contacts, camera).

### Decision

Use React Native with Expo in managed workflow.

### Rationale

- **Managed workflow** simplifies builds, OTA updates, and native module management
- **Expo SDK** provides polished APIs for notifications, image picking, and secure storage
- **EAS Build** handles iOS/Android builds without local Xcode/Android Studio setup
- **Hot reload** enables fast iteration during development
- Can eject to bare workflow later if needed for custom native modules

### Trade-offs

- Some native modules require custom dev clients
- Slightly larger app size compared to bare React Native
- Dependent on Expo's release cycle for SDK updates

---

## ADR-002: Supabase as Backend

**Status:** Accepted
**Date:** 2025-01-10

### Context

We need authentication, a database, file storage, and real-time capabilities without building and maintaining custom backend infrastructure.

### Decision

Use Supabase for all backend services.

### Rationale

- **PostgreSQL** provides relational data modeling with full SQL support
- **Row Level Security (RLS)** enables secure, user-scoped data access
- **Built-in Auth** integrates with Apple Sign In
- **Storage** handles profile photos and attachments
- **Real-time subscriptions** can power live updates
- Generous free tier for MVP development
- Self-hostable if we need to migrate later

### Trade-offs

- Vendor lock-in (mitigated by PostgreSQL portability)
- Complex queries may require Edge Functions
- RLS policies require careful design

---

## ADR-003: Apple Sign In as Primary Auth

**Status:** Accepted
**Date:** 2025-01-10

### Context

We need user authentication that's frictionless, secure, and works well on iOS.

### Decision

Use Apple Sign In as the primary (and initially only) authentication method.

### Rationale

- **Required by Apple** for apps offering third-party sign-in
- **Privacy-focused** — users can hide their email
- **Seamless UX** — Face ID/Touch ID integration
- **No password management** burden for users
- Supabase has native Apple OAuth support

### Future Considerations

- Add Google Sign In for Android users
- Consider email magic links as fallback

---

## ADR-004: RevenueCat + Stripe for Payments

**Status:** Accepted
**Date:** 2025-01-10

### Context

We need subscription management that handles App Store/Play Store in-app purchases while providing flexibility for future payment methods.

### Decision

Use RevenueCat for subscription orchestration with Stripe as payment processor.

### Rationale

- **RevenueCat** abstracts App Store/Play Store subscription complexity
- Unified API for iOS and Android purchases
- Handles receipt validation, subscription status, and webhooks
- **Stripe** enables web payments and potential B2B features later
- Both provide excellent analytics dashboards

---

## ADR-005: Superwall for Paywall Management

**Status:** Accepted
**Date:** 2025-01-10

### Context

We want to A/B test paywall designs and optimize conversion without app updates.

### Decision

Use Superwall for paywall presentation and experimentation.

### Rationale

- Remote paywall configuration without code changes
- Built-in A/B testing for paywall variants
- Native integration with RevenueCat
- Reduces time-to-test for monetization experiments

---

## ADR-006: PostHog for Analytics

**Status:** Accepted
**Date:** 2025-01-10

### Context

We need product analytics to understand user behavior, track feature usage, and measure retention.

### Decision

Use PostHog for product analytics.

### Rationale

- **Open-source** with self-hosting option
- Feature flags for gradual rollouts
- Session recordings (optional, for debugging)
- Funnel and retention analysis
- Privacy-conscious (can self-host, EU hosting available)
- Generous free tier

---

## ADR-007: Expo Notifications

**Status:** Accepted
**Date:** 2025-01-10

### Context

Smart reminders are core to Memo. We need reliable push notifications that work across iOS and Android.

### Decision

Use Expo Notifications with Expo Push Service.

### Rationale

- Seamless integration with Expo managed workflow
- Handles iOS APNs and Android FCM abstraction
- Push tokens management built-in
- Can schedule local notifications for reminders
- Expo Push Service is free and reliable

### Implementation Notes

- Store push tokens in Supabase user profiles
- Use Supabase Edge Functions or cron jobs for scheduled notifications
- Local notifications for offline reminder scheduling

---

## ADR-008: Hero UI + Liquid Glass Design System

**Status:** Accepted
**Date:** 2025-01-10

### Context

We want a modern, polished UI that feels native to iOS while being distinctive.

### Decision

Use Hero UI components styled with a "Liquid Glass" aesthetic.

### Rationale

- Hero UI provides accessible, well-tested components
- Liquid Glass (glassmorphism) creates a modern, warm aesthetic
- Aligns with iOS design language while being distinctive
- Customizable to our design vision

### Design Principles

- Soft shadows and subtle transparency
- Warm color palette (consider: soft peach, warm gray, gentle purple)
- Generous whitespace
- Rounded corners and smooth animations
- Focus on readability and touch targets

---

## Future Considerations

### Potential Additions

- **Offline-first architecture** with local SQLite and sync
- **Background fetch** for notification scheduling
- **Widgets** for iOS home screen
- **Shortcuts/Siri integration** for quick catch-up logging
- **Export functionality** for user data portability
