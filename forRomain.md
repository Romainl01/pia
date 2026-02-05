# Memo — What I Built and What I Learned

> Last updated: February 2026 — Dark mode theming, Journal feature, native component state sync

---

## What Is Memo?

Memo is a personal relationship manager. The idea is simple: life gets busy, and the people you care about slip through the cracks. You forget to text back, you miss a birthday, you realize it's been three months since you talked to your best friend.

Memo fixes that. You add the people who matter, tell the app how often you want to reach out, and it nudges you at the right time. One tap logs that you caught up. That's it.

Think of it as a fitness tracker, but for friendships.

---

## The Big Picture — How Everything Fits Together

Imagine the app as a building with three floors:

```
┌─────────────────────────────────────┐
│         SCREENS (app/)              │  ← What the user sees
│   Friends list, Add Friend modal    │
├─────────────────────────────────────┤
│         FEATURES (src/features/)    │  ← Smart UI components
│   FriendCard, FriendsList, etc.     │
├─────────────────────────────────────┤
│         ENGINE (src/stores,         │  ← The brain
│   services, hooks, utils)           │
└─────────────────────────────────────┘
```

**Top floor — Screens** (`app/`): These are the pages the user navigates between. In Expo Router, the file system *is* the navigation. A file at `app/(tabs)/friends.tsx` becomes the `/friends` route. The screens are thin — they mostly import smart components and wire them up.

**Middle floor — Features** (`src/features/`): These are the bigger UI building blocks that belong to a specific feature. `FriendCard` knows how to render a friend with their status. `FriendsList` knows how to sort and display all friends. They're more than generic components but less than full screens.

**Ground floor — The Engine** (`src/stores/`, `src/services/`, `src/hooks/`, `src/utils/`): This is where the real logic lives. Stores hold state. Services talk to the OS (notifications, contacts). Hooks bridge React to those services. Utils are pure functions with zero dependencies.

The key insight: **data flows down, actions flow up.** A screen reads from a store. A user taps a button. That triggers a store action. The store updates. The screen re-renders. Simple loop.

---

## The Tech Stack — What We Use and Why

### React Native + Expo (Managed Workflow)

We're building a native mobile app without writing Swift or Kotlin. Expo handles the native complexity. The "managed workflow" means we don't touch Xcode or Android Studio — Expo builds everything for us.

**Why Expo over raw React Native?** Same reason you would use a dishwasher instead of washing by hand. You *could* configure the Metro bundler, link native modules, and debug Xcode builds yourself. Or you could let Expo handle all of that and focus on the app.

### Expo Router (File-Based Routing)

Instead of defining navigation in code ("when user taps X, go to screen Y"), the file system defines routes. `app/friends.tsx` → the `/friends` screen. `app/add-friend.tsx` → the `/add-friend` screen.

This is borrowed from Next.js on the web. It's less flexible than manual navigation, but you never have to wonder "where is this screen defined?" — the file path *is* the answer.

### Zustand (State Management)

State management is how the app remembers things. "What friends does the user have? When did they last catch up? Is a toast visible?"

We use Zustand, which is radically simple compared to alternatives like Redux. Here's the mental model: a Zustand store is just a JavaScript object with some functions attached. Components subscribe to it. When the object changes, subscribers re-render. That's it.

No providers, no reducers, no actions, no dispatchers. Just an object and functions.

**Why not Redux?** Redux is a bulldozer. Zustand is a shovel. We're planting a garden, not demolishing a building.

### TypeScript

Every variable, every function parameter, every return value has a type. This catches bugs before they happen. If a function expects a `Friend` object and you pass it a `string`, TypeScript yells at you *before* the app crashes.

It feels tedious at first ("why do I have to annotate all this?"). Then it saves you from a bug that would have taken two hours to find, and you never look back.

---

## Feature Deep Dive — The Friends System

### How Friends Are Stored

Each friend is an object in a Zustand store:

```typescript
{
  id: "1706123456789-abc123",
  name: "Sarah Chen",
  photoUrl: "file:///contacts/photo.jpg",
  birthday: "1995-03-15",
  frequencyDays: 14,        // Reach out every 2 weeks
  lastContactAt: "2026-01-20",
  createdAt: "2026-01-10T..."
}
```

The `frequencyDays` is the heartbeat. Combined with `lastContactAt`, the app knows: "Sarah is due in 8 days" or "You're 3 days overdue with Sarah."

### The Urgency Sort

The friends list isn't alphabetical — it's sorted by *who needs attention most*. The math is simple:

```
daysRemaining = frequencyDays - daysSince(lastContactAt)
```

Negative means overdue. Zero means today. The list sorts ascending, so overdue friends bubble to the top. This is the core UX insight: **don't make the user think about who to contact. Show them.**

### The One-Tap Catch-Up

Tap the checkmark → `lastContactAt` updates to today → toast appears → friend drops down the list. One tap, done.

But here's the subtle part: the toast has an **undo button**. The store's `logCatchUp` function returns the *previous* `lastContactAt` value. If you tap undo, it restores that date. This is a pattern called **optimistic UI with rollback** — the UI updates instantly (optimistic), but keeps a way to reverse it (rollback).

---

## Feature Deep Dive — Notifications

### The Scheduling Brain

Notifications aren't sent from a server. They're **scheduled locally** on the device using Expo's notification API. Every time the friends list changes, the app:

1. Cancels all previously scheduled notifications
2. Recalculates which friends are due or have birthdays
3. Schedules new notifications for tomorrow morning (9-10 AM window)

This "cancel everything, reschedule everything" approach sounds wasteful, but it is actually the simplest correct solution. Trying to update individual notifications leads to bugs where old ones linger or new ones get missed.

### Birthday Grouping

If multiple friends have birthdays on the same day, they're grouped into one notification: "It's Sarah and Mike's birthday today! 🎉" instead of two separate ones. Small touch, but it's the difference between an app that feels robotic and one that feels thoughtful.

### The Permission Dance

Notification permission is requested *after* the user adds their first friend — not on app launch. Why? Because asking "Can we send you notifications?" before the user has done anything feels like spam. After they've added a friend, they understand *why* the app needs permission.

There's a 400ms delay after the "add friend" sheet closes before the permission dialog appears. This prevents two modal dialogs from overlapping, which would feel janky.

---

## UI Decisions — Why Things Look the Way They Do

### Liquid Glass (iOS 26+)

The app uses Apple's new "Liquid Glass" effect for buttons and menus. This is the design language of iOS 26, and using it makes the app feel native rather than like a web app wearing an iOS costume.

We use `GlassView` for persistent elements (buttons, menus) and `BlurView` for transient ones (toasts). Why the distinction? `GlassView` is heavier to render, and mounting/unmounting it rapidly (like a toast appearing and disappearing) can cause visual glitches.

### Typography: Two Fonts

- **CrimsonPro** (serif) for headings — gives warmth and personality
- **Inter** (sans-serif) for body text — clean and readable

This two-font pairing is a classic design pattern. The serif headlines make the app feel less "techy" and more personal, which fits a relationship app.

### Color Palette

The primary color is a warm orange (`#F28C59`). Not the aggressive startup orange — a softer, friendlier one. The surface color is a warm off-white (`#F9F7E8`) instead of pure white. These choices make the app feel warm and approachable, not clinical.

---

## Lessons Learned

### 1. Zustand Store Testing Is Delightfully Simple

Testing Zustand stores doesn't require rendering components or setting up providers. You just call `store.getState()` and `store.setState()` directly:

```typescript
beforeEach(() => {
  useFriendsStore.setState({ friends: [] });
});

it('should add a friend', () => {
  useFriendsStore.getState().addFriend(mockFriend);
  expect(useFriendsStore.getState().friends).toHaveLength(1);
});
```

This is one of the reasons Zustand was chosen over Redux. The testing story is *much* simpler.

### 2. Notification Scheduling Is a State Machine Problem

The first attempt at notifications had bugs: duplicate notifications, notifications for friends you already caught up with, birthday notifications firing every day. The fix was treating notification scheduling as a state machine with clear rules:

- "Should I send a birthday notification?" — Only if one has not been sent today.
- "Should I send a catch-up notification?" — Only if enough days have passed since the last one for this friend.

The `notificationStateStore` tracks these states persistently (survives app restarts via AsyncStorage).

### 3. Toast Timing Is Trickier Than You'd Think

The first toast implementation had a bug: showing the same toast twice (for example, catching up with the same friend twice) would not re-trigger the animation because React saw the same component with the same props. The fix was a `toastId` counter that increments on every show, forcing React to unmount and remount the toast.

This is a React fundamentals lesson: **if you want to reset a component, change its `key`.**

### 4. File-Based Routing Changes How You Think

With Expo Router, you can't have a screen that doesn't map to a URL. This forces clean architecture: every screen is a route, every route is a file. No hidden screens, no mystery navigation.

The `(tabs)` folder with parentheses is a "group" — it creates a tab navigator but does not add "tabs" to the URL. So `app/(tabs)/friends.tsx` is just `/friends`, not `/tabs/friends`. The parentheses are invisible to the user.

### 5. Separate Route Files from Business Logic

The `app/` directory contains almost no logic. Screen files import feature components and maybe read from stores. All the real work happens in `src/`. This means:

- You can refactor navigation without touching business logic
- You can test business logic without rendering screens
- New team members can understand the app's structure at a glance

This pattern is borrowed from web frameworks (Next.js does the same thing with `pages/` vs `lib/`).

### 6. The "Cancel Everything" Pattern

When recalculating notifications, we cancel all scheduled notifications and reschedule from scratch. This sounds inefficient, but it eliminates an entire class of bugs around stale notifications. The lesson: **sometimes the straightforward approach is the smartest one.** Incremental updates are clever but fragile. Full recalculation is simple and correct.

### 7. Check the Obvious Before the Obscure

The liquid glass components (tab bar, bottom sheets) were rendering dark instead of translucent. The instinct was to dive into GitHub issues — opacity animation bugs, Expo Go limitations, screen transition flickering. Hours could have been spent chasing those.

The actual cause? **The phone was in dark mode.**

iOS Liquid Glass uses `UIBlurEffect` under the hood, which automatically adapts to the system appearance. In dark mode, it samples darker backgrounds and renders with darker tints. This is *intentional behavior*, not a bug.

The debugging lesson: **always check system settings first.** Dark mode, reduced motion, font scaling, low power mode — these affect rendering in ways that can look like bugs. Before searching GitHub issues or Stack Overflow, ask: "Did the user (or I) change a device setting?"

This applies beyond dark mode: if something "suddenly" looks wrong, the simplest explanation is usually right. A setting changed. A dependency updated. A cable came loose. Start there.

### 8. The Two Worlds Problem — JavaScript vs Native

After implementing dark mode with Zustand and a `useTheme()` hook, we toggled to dark mode in settings... and the tab bar stayed light. The bottom sheets stayed light. Only the React components changed.

The problem: **React Native has two worlds that don't automatically talk to each other.**

```
┌─────────────────────┐         ┌─────────────────────┐
│   JavaScript World  │         │    iOS Native World │
│                     │   ✗     │                     │
│  Zustand store:     │ ──────> │  NativeTabs         │
│  theme = "dark"     │ (no     │  formSheet          │
│                     │  link)  │  Liquid Glass       │
└─────────────────────┘         └─────────────────────┘
```

When you change state in Zustand, React components re-render because they're subscribed to that state. But NativeTabs and formSheet aren't React components — they're thin wrappers around UIKit. They ask iOS directly: "What appearance should I use?" And iOS says whatever the *system* setting is, not your app's setting.

The fix required building bridges:

```typescript
// Bridge 1: Tell iOS at the system level
Appearance.setColorScheme(resolvedTheme);

// Bridge 2: Tell React Navigation (which NativeTabs reads from)
<ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
```

The broader lesson: **whenever you use native components (NativeTabs, native modals, pickers), ask yourself: "How does this component know about my app's state?"** If the answer is "it doesn't," you need to build a bridge.

This is a fundamental React Native concept. Your JavaScript state is isolated from the native layer unless you explicitly sync it. Most of the time React Native handles this automatically (when you set `style={{ backgroundColor: 'red' }}`, the native view updates). But some native components have their own state sources — like reading the system appearance — and those need manual synchronization.

---

## How Good Engineers Think

### Start With the Data Model

The `Friend` type was designed before any UI was built. Once you know the shape of your data, everything else follows. The urgency calculation, the notification scheduling, the sort order — they all derive from `frequencyDays` and `lastContactAt`.

Before writing a single component, ask: "What does my data look like?"

### Make the Common Path Effortless

The most common action in Memo is logging a catch-up. It's one tap. Not "open friend, tap log, confirm, close." One tap on the main list. The toast confirms it happened. Undo is right there if you tapped by accident.

Good engineering isn't just about code — it's about removing friction from the thing users do most.

### Test the Brain, Not the Face

Most tests in Memo test stores and utilities (the "brain"), not visual output (the "face"). A store test runs in milliseconds. A component rendering test is slower and more brittle. Focus testing effort where the logic is, not where the pixels are.

### Naming Is Documentation

- `getDaysRemaining` — you know what it does
- `shouldSendCatchUpNotification` — you know what it returns
- `logCatchUp` — you know the action

Good names eliminate the need for comments. If you need a comment to explain what a function does, rename the function instead.

---

## What's Next

The Journal and Settings tabs are placeholders. The roadmap includes:
- **Journal entries** — log notes about conversations, attach them to friends
- **Settings** — notification preferences, data export, theme options
- **Richer friend profiles** — topics to discuss, shared memories, relationship notes

The architecture is ready for all of this. Stores can be added without touching existing ones. Features can be built in `src/features/journal/` without modifying the friends code. That's the payoff of clean separation.

---

*This is a living document. It gets updated when something big ships or when we learn something worth writing down.*
