# PlayScout — setup & deployment

PlayScout is a React + Vite browser-game discovery site with a Supabase-powered admin dashboard.

## 1. Requirements

- Node.js 20+
- A GitHub account
- A Supabase project
- A domain name (recommended for a public launch)

## 2. Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite.

Without Supabase credentials, the public site runs in preview mode with sample cards. Admin login and database management require Supabase configuration.

## 3. Configure Supabase

1. Create a project at https://supabase.com/.
2. Open SQL Editor.
3. Run the complete `supabase/schema.sql` file.
4. In Authentication > Providers, ensure Email provider is enabled.
5. In Authentication > Users, create your admin user with a strong password.
6. Copy the user's UUID from the user details.
7. In SQL Editor, run:

```sql
insert into public.admin_users (user_id)
values ('PASTE-YOUR-AUTH-USER-UUID');
```

8. Open Project Settings > API and copy:
   - Project URL
   - `anon` / publishable key

Do **not** put the Supabase `service_role` key in a browser app, GitHub repository, or Vite environment variable. The anon key is intended for browser use; Row Level Security protects the database.

## 4. Add environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_ADSENSE_CLIENT=
VITE_ADSENSE_ENABLED=false
```

Restart the dev server after changing environment variables.

## 5. Admin dashboard

Open `/` then click **Admin**, or navigate to `/#/admin`.

Sign in with the admin user created in Supabase Authentication. The user must also have a row in `public.admin_users`.

From the dashboard you can:
- Add / edit / delete game listings
- Set draft, published, or archived status
- Add categories, cover URLs, official URLs, and authorized embed URLs
- Set Featured, Trending, and New flags
- Add SEO title and description

Only published games are visible to public visitors.

## 6. Deploy to GitHub Pages

1. Create a new GitHub repository, e.g. `playscout`.
2. Upload the project files to the repository root (including `.github` and `supabase`).
3. In repository Settings > Secrets and variables > Actions, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Go to Settings > Pages and set **Build and deployment** source to **GitHub Actions**.
5. Push to the `main` branch. The workflow builds and deploys the site.
6. Open the Pages URL shown by GitHub.

The Vite config uses a relative base path so it works on GitHub Pages project URLs. Hash-based navigation avoids needing server rewrite rules.

### Alternative: Netlify / Vercel

Import the GitHub repository and add the same environment variables in the hosting provider's project settings. Set build command to `npm run build` and publish directory to `dist`.

A custom domain with HTTPS is recommended for SEO and AdSense.

## 7. Add a game

In Admin > Add game:
- Use a concise title and unique slug.
- Use an image URL that you own or are licensed to use.
- Enter the game's official URL.
- Choose `External link` if the game cannot be embedded.
- Choose `Embed in PlayScout` or `Embed + external` only when the developer/provider explicitly permits iframe embedding.
- Write an original description and clear instructions.
- Add a unique SEO title and description.
- Set status to Published when the listing is ready.

Some game hosts block iframe embedding with `X-Frame-Options` or Content Security Policy. In that case use External link. Do not try to bypass those restrictions.

## 8. Google AdSense readiness

The project includes reserved ad placements and `public/ads.txt`, but ads are disabled by default.

Before enabling ads:
1. Publish useful original content and a meaningful collection of games.
2. Add About, Contact, Privacy Policy, and Terms pages with accurate information.
3. Verify you have rights to use all game artwork, names, screenshots, and embeds.
4. Apply to AdSense and complete Google's site review.
5. After approval, add the exact publisher ID and approved ad unit IDs from AdSense.
6. Add the official AdSense script and real ad unit markup. Update `AdSlot.jsx` for your actual slot IDs.
7. Add the exact `ads.txt` line supplied by Google.

Never click your own ads, ask visitors to click ads, or place ads so they look like game controls. Do not display ads on thin, empty, or misleading pages. Ad approval and earnings are not guaranteed.

## 9. SEO launch checklist

- Replace `YOUR-DOMAIN.com` in `public/robots.txt` and `public/sitemap.xml`.
- Add your domain to Google Search Console.
- Submit `/sitemap.xml`.
- Use original game descriptions and descriptive alt text.
- Add unique metadata for each game.
- Avoid publishing duplicate, empty, or unauthorized listings.
- Add canonical URLs and structured data as the site grows.

### Important MVP limitation

This first version uses a single-page React app and hash navigation. The game detail view has metadata, but hash routes are not ideal for search indexing because they are not separate server-rendered HTML pages. For a serious SEO/AdSense launch, the next iteration should use prerendering or a framework with static generation (for example, Astro or Next.js) so every published game gets its own crawlable HTML page and canonical URL.

## 10. Security notes

- Keep the Supabase service-role key private and server-side only.
- Enable RLS (included in schema).
- Add only trusted admin UUIDs to `admin_users`.
- Use strong passwords and enable MFA for admin accounts where possible.
- Restrict allowed redirect URLs in Supabase Auth settings to your real domains.
- Back up the Supabase database periodically.
