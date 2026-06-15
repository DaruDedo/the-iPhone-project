# Drizzle Setup

1. Open Supabase SQL Editor.
2. Open `supabase/drizzle-variant-migration.sql` from this repo.
3. Copy the whole SQL file contents, not the file path.
4. Paste it into the Supabase SQL editor and run it once.
5. In `.env.local`, add:

```env
DATABASE_URL=your-supabase-pooler-or-direct-postgres-url
DIRECT_DATABASE_URL=your-supabase-direct-postgres-url
```

Use the Supabase dashboard connection string values. Keep Supabase Auth/Storage env vars as they are.

After this, restart the Next.js server so Drizzle can read the new variables.
