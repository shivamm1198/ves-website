# Supabase setup guide

This connects the website to Supabase so the president can edit content from the dashboards at
**`/admin`**. It takes about 15 minutes, all in the Supabase dashboard. No coding needed.

**What you'll end up with**

| Dashboard           | URL              | What it manages                                                                                                                                                       |
| ------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Homepage editor** | `/admin/content` | Organisation details, headline numbers, members map, founder, internships, steps, FAQs, scholarships, news, YouTube videos, members, patrons, pillars, wings, journey |
| **Events**          | `/admin/events`  | Create, edit, hide and delete events with a cover photo                                                                                                               |
| **Gallery**         | `/admin/gallery` | Bulk-upload photos with captions and categories, edit, delete                                                                                                         |

---

## Step 1: Create the project

1. Go to **[supabase.com/dashboard](https://supabase.com/dashboard)** and sign in (or sign up, which is free).
2. Click **New project**.
3. Fill in:
   - **Organization:** your organisation (create one if asked).
   - **Project name:** `vidhi-ekta-sangh`
   - **Database password:** click **Generate a password** and **save it somewhere safe**. You won't
     need it for this setup, but you can't see it again later.
   - **Region:** **South Asia (Mumbai)**, which is closest to your visitors.
4. Click **Create new project** and wait 1–2 minutes until the dashboard finishes setting up.

## Step 2: Create the tables (SQL)

1. In the left sidebar, open **SQL Editor**.
2. Click **+ New query** (or the **+** tab).
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this repository, **copy all of it**,
   and paste it into the editor.
4. Click **Run** (or press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>).
   You should see **"Success. No rows returned"**.

This creates:

- `admins`: who is allowed into the dashboards
- `site_content`: the homepage editor's sections
- `events` and `gallery_items`
- a public `media` storage bucket for images (10 MB per file)
- security rules: **anyone can read; only admins can add, change or delete**

> The script is safe to run again. Re-running it changes nothing that already exists.

> **Already set up before the Student Journal was added?** Run
> [`supabase/journal.sql`](supabase/journal.sql) once in a new SQL Editor query. It creates the
> `articles` table and a public `documents` bucket for PDF/Word papers (20 MB each). New projects
> don't need it, because `schema.sql` already includes it.

### Optional: start with the sample events and photos

To keep the sample events and gallery from the preview (you can delete them later from the dashboards),
open a **new query**, paste [`supabase/seed.sql`](supabase/seed.sql), and click **Run**.
Skip this to start with an empty events list and gallery.

## Step 3: Check the storage bucket

1. Open **Storage** in the left sidebar.
2. You should see a bucket called **`media`** marked **Public**. If it's there, nothing else is needed.

## Step 4: Create the president's login

1. Open **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter the president's **email** and a **strong password**, and tick **Auto Confirm User**.
4. Click **Create user**.

## Step 5: Make that user an admin

Creating a login is not enough. The account must also be listed as an admin.

1. Go back to **SQL Editor → + New query**.
2. Paste [`supabase/make-admin.sql`](supabase/make-admin.sql).
3. Replace `president@example.com` with the email from Step 4.
4. Click **Run**. The result table at the bottom should list that email.

Repeat steps 4–5 for anyone else who should have access.
To remove access later: `delete from public.admins where email = 'someone@example.com';`

## Step 6: Turn off public sign-ups (recommended)

Only admins can change anything even if someone signs up, but turning sign-ups off keeps the user list
clean.

1. Open **Authentication → Sign In / Providers** (called **Providers** in some versions).
2. Under **User Signups**, switch **Allow new users to sign up** **off**.
3. Click **Save**.

## Step 7: Copy the two keys into the website

1. Open **Project Settings** (gear icon at the bottom of the sidebar).
2. **Project URL:** go to **Data API** and copy the **Project URL**
   (looks like `https://abcd1234.supabase.co`).
   You can also click the **Connect** button at the top of the dashboard to see it.
3. **Publishable key:** go to **API Keys** and copy the **Publishable key** (starts with `sb_publishable_`).
   If your project only shows legacy keys, click **Create new API keys** first. The legacy `anon` key also
   works, but stops working at the end of 2026.

> **Never** use the _secret_ key (`sb_secret_…`) or `service_role` key in the website. They aren't
> needed.

### Where to paste them

**On Vercel (live site):** Project → **Settings → Environment Variables**, add both for
**Production**, **Preview** and **Development**, then **Redeploy**:

| Name                                   | Value                |
| -------------------------------------- | -------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | your Project URL     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key |

**On your computer:** copy `.env.example` to `.env.local`, paste the values, and restart `npm run dev`.

## Step 8: Set the site URL for auth

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to your live website address, e.g. `https://vidhiektasangh.org`
   (or your `…vercel.app` address).
3. Click **Save**.

## Step 9: Sign in

Open **`https://your-site/admin`**, sign in with the president's email and password, and you're in.

- **Homepage editor:** pick a section on the left, edit, then **Save & publish** (or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> +
  <kbd>S</kbd>). The website updates immediately. **Restore original** brings back the built-in text for
  that section.
- **Forms & links** (in the Homepage editor): paste your Google Form links for **Join VES** and
  **Scholarships**. Each internship and scholarship also has its own **Application form link**. When a
  link is empty, the button falls back to the contact page (or an email application for internships).
- **Logo:** upload it in **Homepage editor → Organisation details**. It appears in the header, footer,
  dashboard and browser tab. Use a square PNG (transparent background works best).
- **Photos around the site** (Homepage editor → Website images): the About images on the homepage and
  About page, and the small floating photos around the members map (4), the About image (2) and the
  founder portrait (2). Landscape photos look best; remove one to hide it.
- **Student Journal** (`/admin/journal`): publish student articles with author details, a summary,
  the article text, an optional cover image and an attached PDF or Word paper. The latest three appear
  on the homepage below Events, and all of them on `/journal`. Each article has its own page.
- **Page text** (Homepage editor): the homepage About section, every part of the About page, the
  Wings page (including "How we're organised"), and shared headings (founder, pillars, patrons,
  journal, and the Join banner). The hero shows the **Tagline** and **Short description** from
  Organisation details.
- **Events:** **New event**, add a cover photo, dates, place and description. Turn **Visible** off
  to hide an event without deleting it.
- **Gallery:** drop several photos at once, set captions and categories, then **Upload**. Large phone
  photos are resized automatically before upload.

---

## Troubleshooting

| Problem                                                                 | Fix                                                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Login page says **"Supabase isn't connected yet"**                      | The two environment variables are missing. Add them (Step 7) and redeploy or restart.                          |
| **"Incorrect email or password"**                                       | Check the user in **Authentication → Users**, or use **⋯ → Send password recovery** there.                     |
| **"This account doesn't have dashboard access"**                        | Run `supabase/make-admin.sql` with that email (Step 5).                                                        |
| **"Email isn't confirmed"**                                             | In **Authentication → Users**, open the user and confirm them, or recreate with **Auto Confirm User** ticked.  |
| Upload fails with **"new row violates row-level security"**             | The account isn't in `admins`, or `schema.sql` didn't finish. Re-run both.                                     |
| **"permission denied for table …"**                                     | Re-run `schema.sql`; it includes the required grants.                                                          |
| A change made directly in Supabase's **Table Editor** isn't on the site | Edits from the dashboards appear instantly. Direct table edits show up within about a minute.                  |
| Want to change the president's password                                 | **Authentication → Users → ⋯ → Send password recovery**, or delete and recreate the user (then re-run Step 5). |

## How it fits together (for developers)

- **Public pages** read Supabase with the publishable key through cached functions
  (`src/lib/content/queries.ts`, Next.js `'use cache'` + `cacheTag`). Dashboard saves call
  `updateTag(...)`, so changes show immediately. Otherwise caches refresh every minute.
- Every homepage section is validated with zod (`src/lib/content/schema.ts`) both when saving and when
  reading. A missing or invalid section falls back to the defaults in `src/data/site.ts`, so the site
  can't break.
- **Security** is enforced by Postgres Row Level Security (`public.is_admin()`), not just the app.
  Server Actions also check admin status before writing.
- Images are uploaded straight from the browser to the `media` bucket (after client-side resizing). The
  database stores the path, and files are removed when their event or photo is deleted.
- Without the environment variables, the whole site runs on the sample content in `src/data/site.ts`.
