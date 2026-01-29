# Pulse / Пульс команды (MAX mini-app)

Мини-апп «Pulse / Пульс команды» для мессенджера MAX. Каркас без бэкенда: Vite + React 18 + TypeScript + локальный сервер валидации initData.

## Локальный запуск

```bash
npm install
cp server/.env.example server/.env
# заполните BOT_TOKEN в server/.env
npm run dev
```

В dev-режиме, если `window.WebApp` отсутствует, используется мок (platform = `web`, version = `dev`).
Параметр `start_param` берётся из query-параметра `?startapp=...`.

## Почему BOT_TOKEN не должен попадать во фронт

Подпись `initData` проверяется через HMAC-SHA256 с секретом бота. Токен хранится **только** на сервере и никогда не должен попадать в клиентский бандл.

## Как работает валидация (кратко)

Сервер берёт `initData`, строит `data_check_string`, вычисляет HMAC-SHA256 подпись с ключом `WebAppData` + `BOT_TOKEN` и сравнивает с `hash`. Дополнительно проверяется `auth_date` (не старше 24 часов).

## Переменные окружения

- `VITE_MAX_BOT_NAME` — имя бота для диплинков. По умолчанию используется `MyPulseBot`.
- `BOT_TOKEN` — в `server/.env`, используется только сервером.

## Реализованные Bridge-фичи

- BackButton (возврат на экран Pulse).
- Share: shareContent/shareMaxContent + fallback на `navigator.share`/clipboard.
- Request contact (получение телефона через события Bridge).
- ScreenCapture (запрет скриншотов).
- Управление яркостью (requestScreenMaxBrightness/restoreScreenBrightness).

## Деплой статики (GitHub Pages)

1. В `vite.config.ts` можно задать `base: '/<repo>/'`.
2. Соберите билд:

```bash
npm run build
```

3. Опубликуйте содержимое `dist/` на GitHub Pages (ветка `gh-pages` или настройка через GitHub Actions).

## Примеры диплинков

```
https://max.ru/<botName>?startapp=daily_today
https://max.ru/<botName>?startapp=retro_sprint12
https://max.ru/<botName>?startapp=incident_INC-481
```

## Где читаем start_param и вызываем ready()

- `start_param` читается из `window.WebApp.initDataUnsafe.start_param` в `src/screens/PulseScreen.tsx`.
- `window.WebApp.ready()` вызывается в `src/App.tsx` при монтировании приложения.

## Тестирование в браузере

- Можно переключать режимы через query: `?startapp=daily_today`.
- Некоторые функции (BackButton, share, requestContact, ScreenCapture, brightness, validation) будут no-op вне MAX.
