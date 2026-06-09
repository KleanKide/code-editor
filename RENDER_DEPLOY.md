# Render Deploy

## What gets deployed

- `my-yandex-code-backend` as a Node web service
- `my-yandex-code-frontend` as a static site
- `my-yandex-code-db` as a Postgres database

All of this is defined in [render.yaml](/abs/path/c:/Users/Star/Documents/nest/my-yandex-code/render.yaml).

## Before deploy

1. Push this repository to GitHub.
2. In Google Cloud Console, open your OAuth client.
3. Add the backend callback URL:

```text
https://YOUR-BACKEND-NAME.onrender.com/auth/google/callback
```

4. Add these authorized origins if needed:

```text
https://YOUR-FRONTEND-NAME.onrender.com
https://YOUR-BACKEND-NAME.onrender.com
```

## Render steps

1. In Render, click `New` -> `Blueprint`.
2. Connect your GitHub repo.
3. Select the branch with this code.
4. Render will read `render.yaml` and create the services.

## Required environment variables

### Backend

- `FRONTEND_URL`
  - Example: `https://my-yandex-code-frontend.onrender.com`
- `GOOGLE_CLIENT_ID`
  - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`
  - From Google Cloud Console
- `GOOGLE_CALLBACK_URL`
  - Example: `https://my-yandex-code-backend.onrender.com/auth/google/callback`

### Frontend

- `VITE_API_URL`
  - Example: `https://my-yandex-code-backend.onrender.com`

## Important notes

- Cookies should work because production mode sets `secure: true` and `sameSite: none`.
- WebSocket connections should work on Render web services.
- `DB_SYNC=true` is currently enabled in `render.yaml`, so TypeORM will auto-sync schema on deploy.
- If you later move to production more seriously, replace auto-sync with migrations.
