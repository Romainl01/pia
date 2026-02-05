# Database Schema

Memo uses Supabase (PostgreSQL) with Row Level Security (RLS) for secure, user-scoped data access.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   profiles  │       │  contacts   │       │  catch_ups  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ email       │  │    │ user_id(FK) │──┘    │ contact_id  │──┐
│ full_name   │  │    │ name        │  │    │ user_id(FK) │  │
│ avatar_url  │  └───>│ photo_url   │  │    │ date        │  │
│ push_token  │       │ birthday    │  │    │ notes       │  │
│ timezone    │       │ notes       │  │    │ type        │  │
│ created_at  │       │ frequency   │  │    │ created_at  │  │
│ updated_at  │       │ last_contact│  │    └─────────────┘  │
└─────────────┘       │ created_at  │  │                     │
                      │ updated_at  │  │                     │
                      └─────────────┘  │                     │
                             │         │                     │
                             └─────────┼─────────────────────┘
                                       │
┌─────────────┐       ┌─────────────────┐
│   journals  │       │ journal_mentions│
├─────────────┤       ├─────────────────┤
│ id (PK)     │──────>│ id (PK)         │
│ user_id(FK) │       │ journal_id (FK) │
│ date        │       │ contact_id (FK) │<────────────────────
│ content     │       │ created_at      │
│ mood        │       └─────────────────┘
│ created_at  │
│ updated_at  │
└─────────────┘
```

## Tables

### profiles

User profiles, linked to Supabase Auth.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  push_token text,
  timezone text default 'UTC',
  notification_enabled boolean default true,
  reminder_time time default '09:00:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Users can only access their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
```

### contacts

People the user wants to stay in touch with.

```sql
create table contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  photo_url text,
  birthday date,
  notes text,
  frequency_days integer default 30, -- desired contact frequency
  last_contact_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table contacts enable row level security;

-- Users can only access their own contacts
create policy "Users can view own contacts"
  on contacts for select
  using (auth.uid() = user_id);

create policy "Users can insert own contacts"
  on contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own contacts"
  on contacts for update
  using (auth.uid() = user_id);

create policy "Users can delete own contacts"
  on contacts for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index contacts_user_id_idx on contacts(user_id);
create index contacts_birthday_idx on contacts(birthday);
```

### catch_ups

Log of interactions with contacts.

```sql
create table catch_ups (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  date timestamptz default now(),
  notes text,
  type text default 'general', -- 'call', 'message', 'in_person', 'general'
  created_at timestamptz default now()
);

-- Enable RLS
alter table catch_ups enable row level security;

create policy "Users can view own catch_ups"
  on catch_ups for select
  using (auth.uid() = user_id);

create policy "Users can insert own catch_ups"
  on catch_ups for insert
  with check (auth.uid() = user_id);

create policy "Users can update own catch_ups"
  on catch_ups for update
  using (auth.uid() = user_id);

create policy "Users can delete own catch_ups"
  on catch_ups for delete
  using (auth.uid() = user_id);

-- Indexes
create index catch_ups_user_id_idx on catch_ups(user_id);
create index catch_ups_contact_id_idx on catch_ups(contact_id);
create index catch_ups_date_idx on catch_ups(date);
```

### journals

Daily journal entries.

```sql
create table journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  content text,
  mood text, -- 'great', 'good', 'okay', 'rough'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- One journal entry per day per user
  unique(user_id, date)
);

-- Enable RLS
alter table journals enable row level security;

create policy "Users can view own journals"
  on journals for select
  using (auth.uid() = user_id);

create policy "Users can insert own journals"
  on journals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journals"
  on journals for update
  using (auth.uid() = user_id);

create policy "Users can delete own journals"
  on journals for delete
  using (auth.uid() = user_id);

-- Indexes
create index journals_user_id_idx on journals(user_id);
create index journals_date_idx on journals(date);
```

### journal_mentions

Junction table linking journals to mentioned contacts.

```sql
create table journal_mentions (
  id uuid default uuid_generate_v4() primary key,
  journal_id uuid references journals(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  created_at timestamptz default now(),

  unique(journal_id, contact_id)
);

-- Enable RLS
alter table journal_mentions enable row level security;

-- Access through parent tables (user must own the journal)
create policy "Users can view own journal_mentions"
  on journal_mentions for select
  using (
    exists (
      select 1 from journals
      where journals.id = journal_mentions.journal_id
      and journals.user_id = auth.uid()
    )
  );

create policy "Users can insert own journal_mentions"
  on journal_mentions for insert
  with check (
    exists (
      select 1 from journals
      where journals.id = journal_mentions.journal_id
      and journals.user_id = auth.uid()
    )
  );

create policy "Users can delete own journal_mentions"
  on journal_mentions for delete
  using (
    exists (
      select 1 from journals
      where journals.id = journal_mentions.journal_id
      and journals.user_id = auth.uid()
    )
  );

-- Indexes
create index journal_mentions_journal_id_idx on journal_mentions(journal_id);
create index journal_mentions_contact_id_idx on journal_mentions(contact_id);
```

## Helper Functions

### Update timestamps automatically

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to tables
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger update_contacts_updated_at
  before update on contacts
  for each row execute function update_updated_at();

create trigger update_journals_updated_at
  before update on journals
  for each row execute function update_updated_at();
```

### Update last_contact_at when catch_up is logged

```sql
create or replace function update_contact_last_seen()
returns trigger as $$
begin
  update contacts
  set last_contact_at = new.date
  where id = new.contact_id
  and (last_contact_at is null or last_contact_at < new.date);
  return new;
end;
$$ language plpgsql;

create trigger update_contact_on_catch_up
  after insert on catch_ups
  for each row execute function update_contact_last_seen();
```

## Views

### Contacts due for follow-up

```sql
create view contacts_due_followup as
select
  c.*,
  coalesce(c.last_contact_at, c.created_at) as effective_last_contact,
  now() - coalesce(c.last_contact_at, c.created_at) as days_since_contact,
  c.frequency_days - extract(day from now() - coalesce(c.last_contact_at, c.created_at)) as days_until_due
from contacts c
where
  now() - coalesce(c.last_contact_at, c.created_at) >= interval '1 day' * c.frequency_days
order by days_until_due asc;
```

## Storage Buckets

```sql
-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- RLS for avatars bucket
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Migration Order

Run migrations in this order:

1. Enable extensions (`uuid-ossp`)
2. Create `profiles` table
3. Create `contacts` table
4. Create `catch_ups` table
5. Create `journals` table
6. Create `journal_mentions` table
7. Create triggers and functions
8. Create views
9. Set up storage buckets
