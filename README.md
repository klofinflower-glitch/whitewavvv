# WHITEWAVE — Telegram Mini App (Full MVP)

Готовый проект: фронтенд (SPA под Telegram Web App) + мок‑бэкенд (Node.js).

## Быстрый старт (Frontend только)
1. Открой `frontend/index.html` в браузере — увидишь рабочий интерфейс.
2. Для Telegram: задеплой `frontend` как статику (Vercel/Netlify/GitHub Pages), URL укажи в BotFather при настройке Web App.

## Стек
- **Шрифты:** системный стек `-apple-system` → на iOS подтянется SF Pro.
- **Тёмная тема:** авто по `Telegram.WebApp.colorScheme`.
- **Разделы:** Главная, Каталог, Избранное, Корзина, Оформление, Друзья/Рефералка, Профиль.
- **UX:** карточка товара (bottom sheet), избранное, корзина с бейджем, форма заказа.

## Бэкенд (мок)
На Node.js/Express — верификация initData и заглушки API. Поднимай отдельно и пропиши его URL в фронте.

