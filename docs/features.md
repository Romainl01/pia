# Feature Specifications

Detailed specifications for Memo's MVP features.

---

## 1. Contacts

### Overview

Users can add and manage people they want to stay connected with. Each contact has a customizable "check-in frequency" that powers smart reminders.

### User Stories

- As a user, I want to add a contact with their name and photo
- As a user, I want to set a birthday for each contact to get reminders
- As a user, I want to set how often I want to reach out to each contact
- As a user, I want to add notes about each contact
- As a user, I want to see when I last connected with someone

### Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Contact's name |
| photo_url | string | No | Profile photo (from camera/gallery) |
| birthday | date | No | For birthday reminders |
| notes | text | No | Freeform notes about the person |
| frequency_days | number | Yes | Desired contact frequency (default: 30) |
| last_contact_at | datetime | No | Auto-updated on catch-up |

### Screens

#### Contact List
- Grid or list view of all contacts
- Visual indicator for contacts due for follow-up
- Search/filter functionality
- Quick action to log catch-up

#### Add/Edit Contact
- Photo picker (camera or gallery)
- Name input
- Birthday picker
- Frequency selector (preset options: weekly, bi-weekly, monthly, quarterly)
- Notes textarea

#### Contact Detail
- Full contact info
- Catch-up history timeline
- Journal entries mentioning this contact
- Quick actions: log catch-up, edit, call/message

### Frequency Presets

| Label | Days |
|-------|------|
| Weekly | 7 |
| Bi-weekly | 14 |
| Monthly | 30 |
| Quarterly | 90 |
| Custom | user-defined |

---

## 2. Smart Reminders

### Overview

Push notifications remind users to reach out to contacts based on their set frequency. Birthday reminders are sent the morning of.

### User Stories

- As a user, I want to receive a notification when it's time to reach out to someone
- As a user, I want to be reminded of birthdays
- As a user, I want to control when I receive notifications

### Notification Types

#### Follow-up Reminder
- Triggered when: `now - last_contact_at >= frequency_days`
- Title: "Time to catch up!"
- Body: "You haven't connected with {name} in a while. How about reaching out?"
- Action: Opens contact detail

#### Birthday Reminder
- Triggered: Morning of birthday (at user's preferred reminder time)
- Title: "Birthday today!"
- Body: "{name}'s birthday is today!"
- Action: Opens contact detail

### Settings

- Global notifications toggle
- Preferred reminder time (default: 9:00 AM)
- Per-contact notification toggle (future)

### Implementation Notes

- Use Expo local notifications for scheduling
- Background task to check and schedule reminders daily
- Push tokens stored in user profile for server-side notifications
- Consider Edge Function cron job for reliable scheduling

---

## 3. Catch-ups

### Overview

Users log interactions with contacts to track their connection history and reset the reminder timer.

### User Stories

- As a user, I want to quickly log that I connected with someone
- As a user, I want to add notes about our conversation
- As a user, I want to see my catch-up history with each contact
- As a user, I want to categorize the type of interaction

### Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contact_id | uuid | Yes | Which contact |
| date | datetime | Yes | When (default: now) |
| notes | text | No | What you talked about |
| type | string | No | call, message, in_person, general |

### Catch-up Types

| Type | Icon | Description |
|------|------|-------------|
| call | 📞 | Phone/video call |
| message | 💬 | Text, DM, email |
| in_person | 👋 | Met in person |
| general | 💫 | Other interaction |

### Screens

#### Quick Log (Modal)
- Contact selector (if not from contact detail)
- Date picker (default: today)
- Type selector
- Notes input (optional)
- Save button

#### Catch-up History (on Contact Detail)
- Chronological list of catch-ups
- Type icon + date + notes preview
- Tap to expand/edit

### UX Considerations

- Logging should be fast (2-3 taps minimum)
- Auto-updates `last_contact_at` on the contact
- Consider "Caught up!" shortcut on reminder notification

---

## 4. Journal

### Overview

Daily journaling with the ability to mention/tag contacts, creating connections between entries and the people in your life.

### User Stories

- As a user, I want to write a daily journal entry
- As a user, I want to tag contacts mentioned in my entry
- As a user, I want to see all journal entries related to a contact
- As a user, I want to track my mood over time

### Data Model

#### Journal Entry
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | date | Yes | One entry per day |
| content | text | No | Journal content |
| mood | string | No | How you're feeling |

#### Mentions (Junction)
| Field | Type | Description |
|-------|------|-------------|
| journal_id | uuid | The journal entry |
| contact_id | uuid | The mentioned contact |

### Mood Options

| Mood | Display |
|------|---------|
| great | Great! ✨ |
| good | Good 😊 |
| okay | Okay 😐 |
| rough | Rough 😔 |

### Screens

#### Journal List
- Calendar view or list of entries
- Mood indicator on each day
- Quick add for today

#### Journal Entry (Edit)
- Date header (editable for past entries)
- Mood selector
- Rich text area
- Contact mentions (@ to mention, or picker)
- Tags displayed as pills

#### Contact Mentions
- `@` trigger shows contact picker
- Mentioned contacts appear as tappable pills
- Tapping pill navigates to contact

### Implementation Notes

- Parse content for `@[ContactName](contact_id)` format
- Store mentions in junction table for querying
- On contact detail, show "Mentioned in X journal entries"

---

## Screen Flow

```
┌─────────────┐
│   Onboard   │ ←── First launch
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Home     │────>│  Contacts   │────>│  Contact    │
│  (Today)    │     │   (List)    │     │  (Detail)   │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐                         ┌─────────────┐
│   Journal   │                         │  Catch-up   │
│   (Today)   │                         │   (Log)     │
└─────────────┘                         └─────────────┘
       │
       ▼
┌─────────────┐
│  Settings   │
└─────────────┘
```

---

## Future Enhancements

### High Priority (Post-MVP)

- **Year-End Rewind** — Beautiful recap of your relationship journey: who you connected with most, memorable moments from journals, catch-up streaks, and relationship growth over the year
- **Relationship types** — Categorize contacts (family, close friend, colleague, acquaintance, situationship) with different default frequencies
- **Smart suggestions** — "Right moment, right words" — AI-assisted message suggestions based on context and relationship history
- **Import contacts** from device address book

### Medium Priority

- **Shared memories** — Attach photos to catch-ups and journal entries
- **Streaks** — Gamification for consistent check-ins
- **Widgets** — iOS home screen widgets showing who to reach out to
- **Siri Shortcuts** — "Log catch-up with Mom"

### Lower Priority

- **Export** — PDF or data export of journals
- **Search** — Full-text search across journals and catch-ups
- **Insights** — Relationship health dashboard with analytics
- **Multi-device sync** — Seamless experience across devices
