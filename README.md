# Pulse / Пульс команды (MAX mini-app)

[![CI](https://github.com/<owner>/max-pulse-miniapp.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/max-pulse-miniapp.github.io/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/<owner>/max-pulse-miniapp.github.io/actions/workflows/pages.yml/badge.svg)](https://github.com/<owner>/max-pulse-miniapp.github.io/actions/workflows/pages.yml)

Мини-апп «Pulse / Пульс команды» для мессенджера MAX. Демонстрационный проект, сделанный в рамках воркшопа для показа возможностей разработки подобных решений для MAX с помощью ИИ‑инструментов. Каркас без бэкенда: Vite + React 18 + TypeScript + локальный сервер валидации initData (опционально) и компаньон-бот для демо.

## Локальный запуск

```bash
npm install
cp server/.env.example server/.env
# заполните BOT_TOKEN в server/.env
# опционально задайте VITE_VALIDATION_URL (см. ниже)

# фронт + сервер
npm run dev

# фронт + сервер + бот
npm run dev:all
```

В dev-режиме, если `window.WebApp` отсутствует, используется мок (platform = `web`, version = `dev`).
Параметр `start_param` берётся из query-параметра `?startapp=...`.

## Бот-компаньон

В папке `/bot` лежит простой бот для демо. Запуск:

```bash
cd bot
npm install
cp .env.example .env
# заполните BOT_TOKEN и BOT_NAME
npm run dev
```

## Почему BOT_TOKEN не должен попадать во фронт

Подпись `initData` проверяется через HMAC-SHA256 с секретом бота. Токен хранится **только** на сервере и никогда не должен попадать в клиентский бандл.

## Как работает валидация (кратко)

Сервер берёт `initData`, строит `data_check_string`, вычисляет HMAC-SHA256 подпись с ключом `WebAppData` + `BOT_TOKEN` и сравнивает с `hash`. Дополнительно проверяется `auth_date` (не старше 24 часов).

## Переменные окружения

- `VITE_MAX_BOT_NAME` — имя бота для диплинков. По умолчанию используется `MyPulseBot`.
- `VITE_VALIDATION_URL` — базовый URL сервера валидации (например `http://localhost:4000`). Если не задан, валидация пропускается.
- `BOT_TOKEN` — в `server/.env`, используется только сервером.

## Реализованные Bridge-фичи

- BackButton (возврат на экран Pulse).
- Share: shareContent/shareMaxContent + fallback на `navigator.share`/clipboard.
- Request contact (получение телефона через события Bridge).
- ScreenCapture (запрет скриншотов).
- Управление яркостью (requestScreenMaxBrightness/restoreScreenBrightness).

## Деплой статики

### GitHub Pages

1. Включите Pages в настройках репозитория (Settings → Pages → Build and deployment → GitHub Actions).
2. Запушьте в ветку `main` — workflow `pages.yml` соберёт `dist/` и опубликует его.
3. Итоговый URL будет вида:

```
https://<owner>.github.io/max-pulse-miniapp.github.io/
```

> В `vite.config.ts` автоматически используется base path `/max-pulse-miniapp.github.io/` при `GITHUB_PAGES=true`.

### Vercel (рекомендуется для продакшена)

1. Import Project → Framework: Vite.
2. Build command: `npm run build`
3. Output: `dist`

Если нужен сервер валидации: поднимите его отдельно (Render/Fly/VPS) и задайте URL через `VITE_VALIDATION_URL`.

## Security headers (CSP)

На GitHub Pages заголовки управляются ограниченно — используйте рекомендации для Vercel/своего хостинга.
Пример `vercel.json` включает CSP с разрешением `https://st.max.ru` и `connect-src` для валидации (замените `https://validation.example.com`).

## Terms & Privacy

Шаблоны находятся в `/public/privacy.html` и `/public/terms.html`.

## Подключение в MAX

1. Загрузите статику на хостинг (Vercel или GitHub Pages), убедитесь, что это HTTPS.
2. В кабинете MAX для партнёров: профиль организации → «Чат-бот и мини-приложение → Настроить» → вставить URL мини-аппа → выбрать кнопку запуска → сохранить.
3. Требования MAX к URL мини-аппа:
   - только `https://`
   - длина URL до 1024 символов
   - допустимые символы: латиница, цифры, точка, дефис
   - пробелы не поддерживаются
4. Диплинки:
   - формат `https://max.ru/<botName>?startapp=<payload>`
   - payload до 512 символов, только `A–Z a–z 0–9 _ -`

## Примеры диплинков

```
https://max.ru/<botName>?startapp=daily_today
https://max.ru/<botName>?startapp=retro_sprint12
https://max.ru/<botName>?startapp=incident_INC-481
```

## Smoke test в MAX

1. На платформе партнёров привяжите мини-приложение к боту (URL должен быть https).
2. Откройте чат с ботом и нажмите «Открыть Pulse».
3. Проверьте режимы через диплинки:
   - https://max.ru/<botName>?startapp=retro_sprint12
   - https://max.ru/<botName>?startapp=incident_INC-481
4. Убедитесь, что в мини-аппе контекст подтягивается из `start_param` и меняет UI.
5. Если тест в группе: назначьте бота админом (иначе события могут не приходить).

## Продакшн-хук (подсказка)

- Dev: используется long polling (`bot.start()`), удобно для разработки.
- Prod: лучше webhook через `/subscriptions` и HTTPS endpoint (параметры: `url`, `update_types`, `secret`).

## Где читаем start_param и вызываем ready()

- `start_param` читается из `window.WebApp.initDataUnsafe.start_param` в `src/screens/PulseScreen.tsx`.
- `window.WebApp.ready()` вызывается в `src/App.tsx` при монтировании приложения.

## Тестирование в браузере

- Можно переключать режимы через query: `?startapp=daily_today`.
- Некоторые функции (BackButton, share, requestContact, ScreenCapture, brightness, validation) будут no-op вне MAX.

## Что проверяет CI

- `npm run lint` — ESLint
- `npm run format:check` — Prettier
- `npm run typecheck` — TypeScript
- `npm run test` — Vitest
- `npm run build` — сборка Vite
