# RentNest 🏠 — Backend API

Rental property marketplace backend. Node.js + Express + TypeScript + PostgreSQL (Prisma) + JWT + Stripe.

## Tech Stack
- Node.js, Express, TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication, bcrypt password hashing
- Zod for request validation
- Stripe for payments
- Swagger (OpenAPI 3) for API docs

## Roles
`TENANT`, `LANDLORD`, `ADMIN` — chosen at registration (`role` field, TENANT or LANDLORD only; admin is seeded).

## Project Structure
```
src/
  config/        env, prisma client, stripe client
  middlewares/   auth, error handler, validator, 404
  modules/       auth, property, category, landlord, rental, payment, review, admin
  routes/        route aggregator
  docs/          OpenAPI spec
  app.ts
  server.ts
prisma/
  schema.prisma
  seed.ts
postman_collection.json
```

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env` and fill in:
   ```bash
   cp .env.example .env
   ```
   You need a PostgreSQL connection string (free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), or Render Postgres) and a Stripe secret key from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) (use the **test mode** key).

3. **Generate Prisma client & run migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Seed the database** (creates admin user + default categories)
   ```bash
   npm run seed
   ```

5. **Run in dev mode**
   ```bash
   npm run dev
   ```
   API runs at `rentnest-backend-seven.vercel.app`, docs at `https://rentnest-backend-seven.vercel.app/api-docs/`.

## Testing Payments Without a Public Webhook

Stripe webhooks need a public URL. For local testing you have two options:

- **Stripe CLI** (recommended): `stripe listen --forward-to localhost:5000/api/payments/confirm`, then use the printed webhook signing secret as ``.
- **Manual fallback**: after completing checkout in test mode, call `GET /api/payments/verify/:sessionId` (auth required) — it fetches the session directly from Stripe and finalizes the payment. Useful for Postman-only grading.

Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC

## Deployment (Render example)

1. Push this repo to GitHub.
2. On [Render](https://render.com): New → Web Service → connect the repo.
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npx prisma migrate deploy && npm start`
3. Add all `.env` variables in Render's Environment tab (use your production `DATABASE_URL`, `CLIENT_URL` = your deployed frontend or a placeholder, etc.)
4. After the first deploy, run the seed script once (Render Shell tab): `npm run seed`
5. Set your Stripe webhook endpoint in the Stripe dashboard to `https://<your-render-url>/api/payments/confirm` and copy the signing secret into ``.

Vercel works too, but Vercel's serverless functions need a slightly different entrypoint (`api/index.ts` wrapping the Express app) since it doesn't support long-running servers — Render is simpler for this stack.

## API Documentation
- **Swagger UI**: `GET /api-docs` (live on your deployed URL too)
- **Postman**: import `postman_collection.json`. Set the `baseUrl` variable to your API root (e.g. `http://localhost:5000/api`), log in, then set the `token` variable to the returned JWT for protected routes.

## Admin Credentials
Set by you in `.env` before seeding (defaults shown below — **change these before submitting**):
```
Email:    admin@rentnest.com
Password: admin123
```

## Error Response Shape (all errors)
```json
{
  "success": false,
  "message": "Human-readable message",
  "errorDetails": { }
}
```

## Success Response Shape
```json
{
  "success": true,
  "message": "Human-readable message",
  "meta": { "page": 1, "limit": 10, "total": 42 },
  "data": { }
}
```

## Rental Request Lifecycle
`PENDING` → (landlord approves) → `APPROVED` → (tenant pays via Stripe) → `ACTIVE` → `COMPLETED` (mark manually or via a future landlord action). Reviews can be left once a request is `ACTIVE` or `COMPLETED`.
