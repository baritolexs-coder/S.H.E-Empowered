# S.H.E Empowered — Member Registration Website

**Support · Heal · Empower**

A branded, step-by-step registration form for S.H.E Empowered members. After registering, members are sent straight to the **S.H.E Empowered Registered Members** WhatsApp group (button on phones, QR code on laptops).

**What's collected**

| Step | Fields | Required? |
|---|---|---|
| 1. About you | Full name, email, phone | ✅ Required |
| 2. Your studies | Level, college, department | ✅ Required |
| 3. Interests | Business (name + what it does), fitness activities, book genres | Optional |
| 4. Review | Members check everything and submit | — |

Responses are saved into a **Google Sheet** you own.

---

## What's in this folder

```
index.html               ← the page
styles.css               ← colours, fonts, layout
script.js                ← form logic + the CONFIG you can edit
assets/                  ← logo, favicon, WhatsApp QR code
google-apps-script.gs    ← paste into Google Sheets to save responses
```

---

## Step 1 — Save responses to a Google Sheet (5 minutes)

1. Go to [sheets.new](https://sheets.new) and name the sheet e.g. **S.H.E Empowered Members**.
2. In the sheet, click **Extensions → Apps Script**.
3. Delete everything in the editor, then paste in the whole of `google-apps-script.gs`. Click 💾 **Save**.
4. Click **Deploy → New deployment**.
   - Click the ⚙️ next to "Select type" → choose **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy**, then **Authorize access** and allow it with your Google account
     (if you see "Google hasn't verified this app", click **Advanced → Go to … (unsafe)** — it's your own script).
5. Copy the **Web app URL** (it ends in `/exec`).
6. Open `script.js` and paste it at the top:

   ```js
   GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```

> Until you do this, the site runs in **preview mode** — it works, but nothing is saved, and a small "Preview mode" note shows at the bottom of the page.

A tab called **Registrations** will appear in the sheet with the first sign-up.

---

## Step 2 — Put the code on GitHub

**No coding tools needed:**

1. Sign in at [github.com](https://github.com) → click **+** (top right) → **New repository**.
2. Name it `she-empowered` → **Public** or **Private** (either works with Vercel) → **Create repository**.
3. Click **uploading an existing file**.
4. Drag in **everything in this folder** — including the `assets` folder — then click **Commit changes**.

**Or with Git:**

```bash
cd she-empowered
git init
git add .
git commit -m "S.H.E Empowered registration site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/she-empowered.git
git push -u origin main
```

---

## Step 3 — Go live on Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**.
2. Click **Add New… → Project** → find `she-empowered` → **Import**.
3. Leave every setting as it is (Framework preset: **Other**) → **Deploy**.
4. In about a minute you'll get a link like `she-empowered.vercel.app`. Share it! 🎉

To get a nicer address: Vercel project → **Settings → Domains** (you can rename to e.g. `sheempowered.vercel.app` if it's free, or connect your own domain).

**Updating the site later:** change a file on GitHub (click the file → ✏️ → Commit) and Vercel redeploys automatically.

---

## Easy customisations (all in `script.js` → `CONFIG`)

- **Colleges dropdown:** list your colleges and the text box becomes a dropdown:
  ```js
  COLLEGES: ["College of Science and Technology", "College of Engineering", "College of Management and Social Sciences", "College of Leadership and Development Studies"],
  ```
- **Levels**, **fitness options** and **book genres:** edit the lists `LEVELS`, `FITNESS`, `GENRES`.
- **WhatsApp link:** `WHATSAPP_LINK`. If you reset the group link, also replace `assets/whatsapp-qr.png` with a new QR code.
- **Colours:** the top of `styles.css` (`--plum`, `--magenta`, `--rose`, `--blush`…).

---

## Good to know

- Works on phones, tablets and laptops; on phones the Back/Continue buttons stick to the bottom of the screen.
- If someone refreshes the page halfway through, their answers are kept on their device until they submit.
- Phone numbers are stored with the leading `0` intact.
- If you change `google-apps-script.gs` later, use **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** so the URL stays the same.
