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

const logEvent = (label: string, details?: Record<string, unknown>) => {
  if (details) {
    // eslint-disable-next-line no-console
    console.log(`[bot] ${label}`, details);
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`[bot] ${label}`);
};

const logError = (label: string, error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[bot] ${label}`, error);
};

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
  // Row 1: open_app (heavy type). Heavy types: open_app/link/request_contact/request_geo_location.
  keyboard.addOpenAppButton(appLabel);
  keyboard.newRow();
  // Row 2: link buttons (max 3 heavy buttons per row)
  keyboard
    .addLinkButton('Daily', makeStartAppLink('daily_today'))
    .addLinkButton('Retro', makeStartAppLink('retro_sprint12'))
    .addLinkButton('Incident', makeStartAppLink('incident_INC-481'));
  keyboard.newRow();
  // Row 3: request_contact (heavy) + help callback (light)
  keyboard.addRequestContactButton('Поделиться контактом');
  keyboard.addCallbackButton('Помощь', 'help');

  return keyboard;
};

const buildModeKeyboard = (label: string, payload: string) => {
  const keyboard = new KeyboardBuilder();
  keyboard.addLinkButton(label, makeStartAppLink(payload));
  return keyboard;
};

const sendMenu = async (chatId: number | string, text: string) => {
  try {
    await bot.sendMessage({
      chatId,
      text,
      keyboard: buildMenu().build(),
    });
    logEvent('menu_sent', { chatId });
  } catch (error) {
    logError('sendMenu', error);
  }
};

const sendModeHint = async (
  chatId: number | string,
  label: string,
  payload: string,
  hint: string,
) => {
  try {
    await bot.sendMessage({
      chatId,
      text: hint,
      keyboard: buildModeKeyboard(label, payload).build(),
    });
    logEvent('mode_hint_sent', { chatId, payload });
  } catch (error) {
    logError('sendModeHint', error);
  }
};

bot.command('start', async (ctx) => {
  try {
    logEvent('command_start', { chatId: ctx.message.chat.id });
    await sendMenu(
      ctx.message.chat.id,
      'Привет! Кнопки ниже открывают мини-апп Pulse и его режимы (Daily/Retro/Incident).',
    );
  } catch (error) {
    logError('command_start', error);
  }
});

bot.command('pulse', async (ctx) => {
  try {
    logEvent('command_pulse', { chatId: ctx.message.chat.id });
    await sendMenu(ctx.message.chat.id, 'Открывайте Pulse через меню ниже.');
  } catch (error) {
    logError('command_pulse', error);
  }
});

bot.action('help', async (ctx) => {
  try {
    logEvent('action_help', { chatId: ctx.message.chat.id });
    await sendMenu(
      ctx.message.chat.id,
      'Подсказка: используйте кнопку “Открыть Pulse” или диплинки для режима.',
    );
  } catch (error) {
    logError('action_help', error);
  }
});

bot.on('message_created', async (ctx) => {
  try {
    const text = ctx.message.text?.toLowerCase() ?? '';
    if (text.includes('daily')) {
      await sendModeHint(
        ctx.message.chat.id,
        'Daily',
        'daily_today',
        'Открываю режим Daily. Нажмите кнопку ниже.',
      );
      return;
    }
    if (text.includes('retro')) {
      await sendModeHint(
        ctx.message.chat.id,
        'Retro',
        'retro_sprint12',
        'Открываю режим Retro. Нажмите кнопку ниже.',
      );
      return;
    }
    if (text.includes('incident')) {
      await sendModeHint(
        ctx.message.chat.id,
        'Incident',
        'incident_INC-481',
        'Открываю режим Incident. Нажмите кнопку ниже.',
      );
      return;
    }

    await sendMenu(ctx.message.chat.id, 'Напиши /pulse или нажми кнопку ниже.');
  } catch (error) {
    logError('message_created', error);
  }
});

bot.start();

// eslint-disable-next-line no-console
console.log('Pulse companion bot started');
