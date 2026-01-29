# Pulse / Пульс команды (MAX mini-app)

Мини-апп «Pulse / Пульс команды» для мессенджера MAX. Каркас без бэкенда: Vite + React 18 + TypeScript.

## Локальный запуск

```bash
npm install
npm run dev
```

В dev-режиме, если `window.WebApp` отсутствует, используется мок (platform = `web`, version = `dev`).
Параметр `start_param` берётся из query-параметра `?startapp=...`.

## Переменные окружения

- `VITE_MAX_BOT_NAME` — имя бота для диплинков. По умолчанию используется `MyPulseBot`.

## Деплой статики (GitHub Pages)

1. В `vite.config.ts` можно задать `base: '/<repo>/'`.
2. Соберите билд:

```bash
npm run build
```

3. Опубликуйте содержимое `dist/` на GitHub Pages (ветка `gh-pages` или настройка через GitHub Actions).

## Примеры диплинков

```
https://max.ru/<botName>?startapp=retro_sprint12
https://max.ru/<botName>?startapp=daily_standup
https://max.ru/<botName>?startapp=incident_42

```

## Где читаем start_param и вызываем ready()

- `start_param` читается из `window.WebApp.initDataUnsafe.start_param` в `src/App.tsx`.
- `window.WebApp.ready()` вызывается в `useEffect` при монтировании `App`.

