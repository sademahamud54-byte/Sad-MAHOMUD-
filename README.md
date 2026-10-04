# SM DOVE SPARROW 🕊️

Telegram Mini App + Express API + Firebase Realtime Database + Admin Panel.

## Production architecture

Telegram Mini App → Render/Express API → Firebase Admin SDK → Firebase Realtime Database

The browser does **not** write directly to Firebase. Firebase Admin SDK runs only on the Render server, so balance, rewards, upgrades and transactions remain server-authoritative.

## Render

Build:
```bash
npm install --legacy-peer-deps && npm run build
```

Start:
```bash
npm start
```

Health check:
```text
/health
```

## Required Render environment variables

- `NODE_ENV=production`
- `NODE_VERSION=22.12.0`
- `APP_NAME=SM DOVE SPARROW`
- `BOT_NAME=SM DOVE SPARROW 🕊️`
- `BOT_USERNAME=SMDOVESPARROW_bot`
- `BOT_TOKEN=<BotFather token>`
- `WEB_APP_URL=https://<your-service>.onrender.com`
- `ADMIN_TELEGRAM_ID=<your Telegram numeric ID>`
- `FIREBASE_PROJECT_ID=sm-dove-sparrow-f041c`
- `FIREBASE_DATABASE_URL=https://sm-dove-sparrow-f041c-default-rtdb.firebaseio.com`
- `FIREBASE_SERVICE_ACCOUNT=<complete Firebase service-account JSON>`

Optional Monetag variables are listed in `.env.example`.

## Firebase rules

Deploy `firebase/database-rules.json` in Realtime Database Rules. The app uses Firebase Admin SDK on the server, so client-side Firebase access is intentionally disabled:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

## Telegram

Set the Mini App URL in BotFather using the menu button or another Mini App launch method. Telegram's official Mini App documentation describes `/setmenubutton` and other launch methods.

Webhook:
```text
https://<your-service>.onrender.com/api/telegram-webhook
```

## Important

The current `InAppAdModal` is a UI countdown, not Monetag's real ad SDK. Do not treat the countdown itself as proof of an ad impression. Replace it with the exact Monetag SDK/tag provided in your Monetag publisher dashboard before enabling real-money ad rewards.
