import express from 'express';
import path from 'path';
import 'dotenv/config';
import authRoutes from './routes/auth.ts';
import userRoutes from './routes/user.ts';
import rewardRoutes from './routes/rewards.ts';
import referralRoutes from './routes/referrals.ts';
import adminRoutes from './routes/admin.ts';
import { telegramService } from './services/telegram.ts';
import { dbService } from './services/firebase.ts';


const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// Telegram Bot Webhook endpoint for /start and referrals
app.post('/api/telegram-webhook', async (req, res) => {
  const update = req.body;
  if (!update || !update.message) {
    res.sendStatus(200);
    return;
  }

  const message = update.message;
  const chatId = message.chat?.id;
  const text = message.text || '';
  const fromUser = message.from;

  if (text.startsWith('/start') && chatId && fromUser) {
    let referrerId: string | undefined = undefined;
    const parts = text.split(' ');
    if (parts.length > 1 && parts[1].startsWith('ref_')) {
      referrerId = parts[1].replace('ref_', '');
    }

    // Auto-register user in database if new
    let user = dbService.getUser(fromUser.id.toString());
    if (!user) {
      user = dbService.createUser(
        {
          telegramId: fromUser.id.toString(),
          firstName: fromUser.first_name,
          lastName: fromUser.last_name,
          username: fromUser.username,
          languageCode: fromUser.language_code,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
        },
        referrerId
      );
    }

    const appName = process.env.APP_NAME || 'Universal Mining App';
    const welcomeText =
      `👋 <b>Welcome to ${appName}!</b>\n\n` +
      `⚡ Tap to mine crypto tokens\n` +
      `🔋 Upgrade your battery & recharge rate\n` +
      `⛏️ Build passive income streams\n` +
      `👥 Invite friends to earn huge bonuses!\n\n` +
      `Press the button below to start mining now! 🚀`;

    const webAppUrl = process.env.WEB_APP_URL || '';
    const keyboard = telegramService.getWebAppStartKeyboard(webAppUrl);

    await telegramService.sendMessage(chatId, welcomeText, keyboard);
  }

  res.sendStatus(200);
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', rewardRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Start Server with Vite middleware in dev or static files in production
async function startServer() {
  await dbService.init();
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Universal Telegram Mini App server running on http://0.0.0.0:${PORT}`);
    console.log(`Telegram Bot configured: ${telegramService.isBotTokenConfigured()}`);
    console.log(`Admin Telegram ID: ${process.env.ADMIN_TELEGRAM_ID || '[NOT SET]'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
