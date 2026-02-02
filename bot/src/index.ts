import dotenv from 'dotenv';
import { Bot, KeyboardBuilder } from '@maxhub/max-bot-api';

dotenv.config();

const botToken = process.env.BOT_TOKEN;
const botName = process.env.BOT_NAME ?? 'MyPulseBot';
const appLabel = process.env.APP_LABEL ?? 'Pulse';

if (!botToken) {
  throw new Error('BOT_TOKEN is required');
}

const bot = new Bot(botToken);

const sanitizePayload = (raw: string): string => {
  const cleaned = raw.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 512);
  return cleaned || 'daily';
};

const makeStartAppLink = (payload?: string): string => {
  if (!payload) {
    return `https://max.ru/${botName}?startapp`;
  }
  return `https://max.ru/${botName}?startapp=${sanitizePayload(payload)}`;
};

const buildMenu = () => {
  const keyboard = new KeyboardBuilder();
  // Row 1: open_app (heavy type)
  keyboard.addOpenAppButton(appLabel);
  keyboard.newRow();
  // Row 2: link buttons (max 3 heavy buttons per row)
  keyboard
    .addLinkButton('Daily', makeStartAppLink('daily_today'))
    .addLinkButton('Retro', makeStartAppLink('retro_sprint12'))
    .addLinkButton('Incident', makeStartAppLink('incident_INC-481'));
  keyboard.newRow();
  // Row 3: request_contact + help callback
  keyboard.addRequestContactButton('Поделиться контактом');
  keyboard.addCallbackButton('Помощь', 'help');

  return keyboard;
};

const sendMenu = async (chatId: number | string, text: string) => {
  try {
    await bot.sendMessage({
      chatId,
      text,
      keyboard: buildMenu().build(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('sendMenu error', error);
  }
};

bot.command('start', async (ctx) => {
  await sendMenu(
    ctx.message.chat.id,
    'Привет! Кнопки ниже открывают мини-апп Pulse и его режимы (Daily/Retro/Incident).',
  );
});

bot.command('pulse', async (ctx) => {
  await sendMenu(ctx.message.chat.id, 'Открывайте Pulse через меню ниже.');
});

bot.action('help', async (ctx) => {
  await sendMenu(
    ctx.message.chat.id,
    'Подсказка: используйте кнопку “Открыть Pulse” или диплинки для режима.',
  );
});

bot.on('message_created', async (ctx) => {
  try {
    const text = ctx.message.text?.toLowerCase() ?? '';
    if (text.includes('daily')) {
      await sendMenu(ctx.message.chat.id, 'Открываю режим Daily.');
      return;
    }
    if (text.includes('retro')) {
      await sendMenu(ctx.message.chat.id, 'Открываю режим Retro.');
      return;
    }
    if (text.includes('incident')) {
      await sendMenu(ctx.message.chat.id, 'Открываю режим Incident.');
      return;
    }

    await sendMenu(ctx.message.chat.id, 'Напиши /pulse или нажми кнопку ниже.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('message_created error', error);
  }
});

bot.start();

// eslint-disable-next-line no-console
console.log('Pulse companion bot started');
