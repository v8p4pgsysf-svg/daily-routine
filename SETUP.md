# Daily Routine: setting up the hosted version

> **Already set up** (31 Oct 2026): the app is live at https://v8p4pgsysf-svg.github.io/daily-routine/ and published from the `docs/` folder of this repository. This guide is kept for reference: rebuilding from scratch, or helping someone set up their own copy.

Time needed: about 30 minutes, once. Cost: £0 on the free plans. A computer is easiest for Parts A to C; Part D is on your iPhone.

You'll use two free accounts:

- **GitHub** hosts the app at a web address you can add to your home screen.
- **Supabase** stores everyone's data. Each person can only ever read and write their own.

---

## Part A: GitHub, the web address (about 3 minutes)

1. **Sign in.** Go to github.com and sign in, or sign up free.

2. **Create the repository.** Choose **New repository**.
   - Name: `daily-routine`
   - Visibility: **Public**. Free GitHub Pages needs this. The code contains none of your data.
   - Leave everything else unticked: no README, no .gitignore, no licence.
   - Choose **Create repository**.

   Your app's address will be `https://YOUR-GITHUB-NAME.github.io/daily-routine/`. For you that's **`https://v8p4pgsysf-svg.github.io/daily-routine/`**.

## Part B: Supabase, the database (about 10 minutes)

3. **Create the project.** Go to supabase.com and choose **Start your project**, then **Continue with GitHub**. Choose **New project**.
   - Name: `daily-routine`
   - Database password: choose one and save it in your password manager. The app never uses it.
   - Region: **West EU (London)**
   - Plan: Free
   - Security options:
     - **Enable Data API:** leave ticked.
     - **Automatically expose new tables:** untick.
     - **Enable automatic RLS:** tick.

   Wait a minute or two while it builds.

4. **Set up the database.** In the left menu, open **SQL Editor** and choose **New query**. Paste in the whole of `supabase/schema.sql` and choose **Run**. You should see *Success. No rows returned.*

5. **Turn off open sign-ups**, so only people you add can get in. Go to **Authentication → Sign In / Providers** and switch off **Allow new users to sign up**. Leave **Email** switched on.

6. **Add yourself.** Go to **Authentication → Users → Add user → Create new user**. Enter your email and **the password you'll sign in with** (at least 8 characters), and tick **Auto Confirm User**.

7. **Set the web address.** Go to **Authentication → URL Configuration** and set **Site URL** to your app's address from step 2.

8. **Send Claude your keys.** At the top of your project dashboard, click **Connect**. It shows:
   - the **Project URL**, which looks like `https://abcd1234.supabase.co`
   - the **Publishable key**, which starts `sb_publishable_…`

   If **Connect** isn't there, both are under **Project Settings → API Keys**. There, the URL is under **Data API** or at the top of the page. An older-style **anon** key (starting `eyJ…`) works too.

   Paste both into the chat. Claude sends back a zip called `site.zip` with your keys already in it. The publishable key is designed to be public: the database's own security rules are what keep data private. **Never share a secret or service_role key.**

## Part C: Publish the app on GitHub (about 3 minutes)

9. **Unzip** `site.zip`. You get a folder of about a dozen files: `index.html`, `host.js`, `config.js`, `supabase.js`, the icons and so on.

10. **Upload the files.** Open your `daily-routine` repository on github.com.
    - On the empty repository page, click the link **uploading an existing file**. (Once the repository has files, it's **Add file → Upload files** instead.)
    - Select **all the files inside the folder**, not the folder itself, and drag them onto the page.
    - Wait for them all to list, then choose **Commit changes**.

11. **Switch on GitHub Pages.** In the repository, go to **Settings → Pages**.
    - Source: **Deploy from a branch**
    - Branch: **main**, folder **/docs** (this repository keeps the live app in `docs/`; a fresh repository with just the app's files at the top level uses **/ (root)**)
    - **Save**

12. **Wait a minute or two**, then open your address from step 2. You should see the Daily Routine sign-in screen. If you get a 404, give it another minute and refresh.

## Part D: Move your data, then install on your iPhone (about 5 minutes)

13. **Export from the Claude version.** Open the Claude version, then go to **Progress → Export all data** and save the zip (Files is fine). It includes your weeks, workouts, settings and progress photos.

14. **Sign in to the new app.** On your iPhone, open your app's address in **Safari** and sign in with your email and password. When the iPhone offers to save the password, say yes: next time it fills in with Face ID.

15. **Import.** Go to **Progress → Import a backup** and choose the zip. It tells you how many weeks, sessions and photos came across.

16. **Add to your home screen.** Tap **Share → Add to Home Screen**. From then on, open it from the icon: it runs full-screen and works offline.

From here on, use the new app. The Claude version keeps working, but the two don't sync with each other.

---

## Inviting your girlfriend or friends

- Add them in Supabase (step 6) with a starting password, and send it to them privately.
- Send them the address and steps 14 and 16. They don't need to import anything.
- They can change their password in the app: **cog → Account → Change password**.
- They start with your routine as the default. Tell them to tap the **cog** to set their own, or to choose **Use a suggested programme**.
- Each person's data is completely separate. You, as the owner, can see the raw database in the Supabase dashboard, so tell them that.

## Updates

Claude is connected to this repository. Ask for a change in the chat: Claude updates `src/weekly-routine.html`, rebuilds `docs/` with `python3 tools/build.py`, runs the tests and publishes. It goes live within a couple of minutes. Your data isn't touched.

On your phone, the app picks up the new version the next time it's opened with a connection. If you don't see a change, close the app fully and open it again.

If the GitHub connection is ever lost, Claude can send the `docs/` files as a zip instead. In the repository, open the **docs** folder, choose **Add file → Upload files**, drag them in, and **Commit changes**.

## Good to know

- **Forgotten passwords.** The app sends no emails, so passwords are reset from the dashboard. Open **SQL Editor**, run this with the person's email and a new temporary password, and tell them to change it in the app:

  ```sql
  update auth.users
  set encrypted_password = extensions.crypt('Temporary-Pass-1', extensions.gen_salt('bf'))
  where email = 'name@example.com';
  ```

- **Inactive projects pause.** Free projects pause after **a week with no use**. Opening the app counts as use. Supabase emails a warning first. If it does pause, open the dashboard and choose **Resume project**; no data is lost. The app still opens offline in the meantime.
- **Free-plan room:** 500 MB of data, which is decades of check-ins, and 1 GB of photos, which is roughly 3,000 progress photos.
- **Backups.** **Export all data** works the same as before. Doing it once a quarter is cheap insurance.
- **Sign-in codes instead of passwords** are possible later. They need your own email sender set up in Supabase (**Authentication → Emails → SMTP Settings**). Tell Claude if you want that.

## What's in this repository

| Path | What it is |
|---|---|
| `docs/` | The live app that GitHub Pages serves |
| `docs/config.js` | Your Supabase address and public key |
| `src/weekly-routine.html` | The app's source: the same page as the Claude version |
| `tools/build.py` | Turns `src/` into `docs/index.html` and `docs/sw.js` |
| `supabase/schema.sql` | Database tables and security rules (step 4) |
| `tests/app.test.js` | Automated checks for the app (`node tests/app.test.js src/weekly-routine.html`, needs jsdom) |
