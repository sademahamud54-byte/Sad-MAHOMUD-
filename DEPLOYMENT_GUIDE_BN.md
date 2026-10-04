# SM DOVE SPARROW — GitHub → Firebase → Render → Telegram

## 1. GitHub repository structure

```text
sm-dove-sparrow/
├── index.html
├── package.json
├── render.yaml
├── firebase.json
├── .firebaserc
├── .env.example
├── .gitignore
├── server.ts
├── middleware/
│   ├── auth.ts
│   ├── admin.ts
│   └── rateLimit.ts
├── routes/
│   ├── auth.ts
│   ├── user.ts
│   ├── rewards.ts
│   ├── referrals.ts
│   └── admin.ts
├── services/
│   ├── firebase.ts
│   ├── telegram.ts
│   ├── security.ts
│   └── ads.ts
├── firebase/
│   └── database-rules.json
├── config/
│   └── app-config.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── context/TelegramContext.tsx
│   ├── services/adRotation.ts
│   └── components/...
└── src/assets/images/...
```

## 2. Files changed for the deployment fix

Replace these files with the versions in this package:

- `package.json`
- `server.ts`
- `middleware/auth.ts`
- `services/firebase.ts`
- `services/telegram.ts`
- `routes/referrals.ts`
- `firebase/database-rules.json`
- `firebase.json`
- `.firebaserc`
- `.env.example`
- `render.yaml`
- `index.html`
- `README.md`

The remaining React UI files can stay as they are.

## 3. Why the old Render deployment failed

The uploaded project was resolving a dependency tree that Render could not complete. The new package pins a compatible Vite/React/Tailwind stack and Render uses:

```bash
npm install --legacy-peer-deps && npm run build
```

## 4. Why Firebase was not actually working

The old `services/firebase.ts` wrote to `data/database.json`. That is local filesystem storage, not Firebase Realtime Database. The new `services/firebase.ts` uses Firebase Admin SDK and loads/saves data under the Firebase Realtime Database.

## 5. Firebase service-account setup

Firebase Console → Project Settings → Service accounts → Generate New Private Key.

Download the JSON once. Never commit it to GitHub.

In Render, add the complete JSON as:

```text
FIREBASE_SERVICE_ACCOUNT
```

Do not put it in `src/`, `config/`, GitHub, or `public/`.

## 6. Firebase database rules

Use exactly:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

This is intentional. The frontend does not need direct Firebase access. Render's Firebase Admin SDK bypasses Realtime Database client rules.

## 7. Render settings

Type: `Web Service`

Runtime: `Node`

Build Command:

```bash
npm install --legacy-peer-deps && npm run build
```

Start Command:

```bash
npm start
```

Health Check Path:

```text
/health
```

Node version:

```text
22.12.0
```

## 8. Required Render variables

```text
APP_NAME=SM DOVE SPARROW
BOT_NAME=SM DOVE SPARROW 🕊️
BOT_USERNAME=SMDOVESPARROW_bot
NODE_ENV=production
NODE_VERSION=22.12.0
BOT_TOKEN=YOUR_BOT_TOKEN
ADMIN_TELEGRAM_ID=YOUR_NUMERIC_TELEGRAM_ID
WEB_APP_URL=https://YOUR-SERVICE.onrender.com
FIREBASE_PROJECT_ID=sm-dove-sparrow-f041c
FIREBASE_DATABASE_URL=https://sm-dove-sparrow-f041c-default-rtdb.firebaseio.com
FIREBASE_SERVICE_ACCOUNT=PASTE_COMPLETE_SERVICE_ACCOUNT_JSON
PORT=10000
```

Also add your Monetag zone variables from `.env.example`.

## 9. After first successful Render deploy

Open:

```text
https://YOUR-SERVICE.onrender.com/health
```

Expected response contains:

```json
{"status":"ok"}
```

Then open:

```text
https://YOUR-SERVICE.onrender.com/api/config/public
```

It should return public configuration JSON. It must not return the Firebase service-account JSON or bot token.

## 10. Telegram BotFather

Set the Mini App URL to:

```text
https://YOUR-SERVICE.onrender.com
```

Use BotFather's menu button/Mini App configuration.

Webhook URL:

```text
https://YOUR-SERVICE.onrender.com/api/telegram-webhook
```

## 11. Git commands

Run locally inside the project folder:

```bash
git init
git add .
git commit -m "Fix Render deployment and connect Firebase"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Never run `git add .env`.

## 12. Final test order

1. Render deploy succeeds.
2. `/health` returns `status: ok`.
3. Firebase Realtime Database shows `settings/game` and `tasks`.
4. Open the Mini App from Telegram.
5. `/auth` succeeds.
6. New user appears under `users/<telegramId>`.
7. Tapping changes the server balance.
8. Transaction appears under `transactions/<id>`.
9. Restart/redeploy Render and confirm the user still exists.

## 13. Monetag warning

The old project has a fake 15-second in-app countdown. It is not the Monetag ad itself. Monetag's official Telegram Mini App formats include Rewarded Interstitial, Rewarded Popup and In-App Interstitial. Use the exact SDK/tag generated in your Monetag publisher dashboard. Do not invent a JS callback or manually award ad money merely because a local timer ended.
