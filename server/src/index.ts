import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateInitData } from './validateInitData';

dotenv.config({ path: 'server/.env' });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const botToken = process.env.BOT_TOKEN ?? '';

app.use(cors());
app.use(express.json());

app.post('/api/validate-init', (req, res) => {
  const { initData } = req.body as { initData?: string };
  const result = validateInitData(initData ?? '', botToken);

  if (!result.ok) {
    res.status(401).json({ ok: false, reason: result.reason ?? 'validation failed' });
    return;
  }

  res.json({ ok: true, data: result.data, warning: result.warning });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MAX validation server listening on ${port}`);
});
