# DollarCord

DollarCord is a full-stack, real-time community chat app inspired by Discord. It includes server-based chat, text channels, direct messages, live presence, typing indicators, message editing, replies, emoji reactions, pinned messages, invite codes, user settings, and role-aware server management.

Built with Next.js 14, TypeScript, Prisma, SQLite, Socket.IO, and Tailwind CSS, DollarCord is designed as a complete learning-friendly example of a modern real-time web application with authentication, database-backed sessions, API routes, and WebSocket events working together.

## GitHub Description

Real-time Discord-inspired chat app with servers, channels, DMs, presence, typing indicators, reactions, pins, and settings, built with Next.js, Prisma, SQLite, Socket.IO, and Tailwind CSS.

## Features

- Authentication with registration, login, logout, bcrypt password hashing, and database-backed sessions.
- Servers with invite codes, owner/admin/member roles, member lists, and server settings.
- Text channels with create, rename, delete, and permission-aware channel management.
- Real-time messaging powered by Socket.IO channel rooms and server rooms.
- Typing indicators and online presence updates.
- Message editing, deletion, replies, emoji reactions, and pinned messages.
- Direct message threads with user search and real-time DM updates.
- User profile settings, display names, bios, and account management screens.
- Seeded demo data for quick local testing.
- Dark, Discord-style interface built with Tailwind CSS.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| UI | React 18, Tailwind CSS |
| Database | SQLite |
| ORM | Prisma 5 |
| Realtime | Socket.IO 4 |
| Auth | Custom sessions, httpOnly cookies, bcryptjs |
| Validation | Zod |
| Runtime | Custom Node.js server |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Install

```bash
npm install
```

### Environment

Create your local environment file:

```bash
cp .env.example .env
```

Use the defaults for local development or update them as needed:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="change-this-to-a-random-secret-at-least-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000
```

Never commit `.env` or your local SQLite database. They are ignored by the included `.gitignore`.

### Database

Run the Prisma migration and optionally seed demo content:

```bash
npx prisma migrate dev
npm run db:seed
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts

After running `npm run db:seed`, you can sign in with:

| Email | Password | Role |
| --- | --- | --- |
| `alice@dollarcord.app` | `password123` | Server owner |
| `bob@dollarcord.app` | `password123` | Server admin |
| `charlie@dollarcord.app` | `password123` | Member |

Seeded content includes the `DollarCord HQ` server, `general`, `off-topic`, and `dev-talk` channels, sample messages, a direct message thread, and the invite code `dollarcord`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the custom Next.js and Socket.IO development server. |
| `npm run build` | Build the app for production. |
| `npm run start` | Start the production server. |
| `npm run postinstall` | Generate the Prisma client after install. |
| `npm run db:migrate` | Run Prisma migrations in development. |
| `npm run db:seed` | Seed demo users, servers, channels, messages, and DMs. |
| `npm run db:reset` | Reset the database and seed it again. |

## Project Structure

```text
prisma/
  migrations/        Database migration files
  schema.prisma      Prisma models for users, sessions, servers, channels, messages, DMs, pins, and reactions
  seed.ts            Demo data used for local development

src/
  app/               Next.js App Router pages, layouts, and API routes
  components/        Chat, layout, modal, settings, and shared UI components
  contexts/          Auth, socket, and toast providers
  lib/               Prisma client, auth helpers, and validation schemas
  server/            Socket.IO server setup
  types/             Shared TypeScript types

server.js            Runtime custom server entrypoint
server.ts            TypeScript custom server reference
```

## Architecture

DollarCord uses a custom Node.js server to run Next.js and Socket.IO on the same port. HTTP API routes handle persistence through Prisma, while Socket.IO broadcasts real-time updates to channel, server, user, and direct message rooms.

Authentication is session based. Login creates a database session and stores the session token in an httpOnly cookie. The same token is used to authenticate Socket.IO connections, so realtime events stay tied to the signed-in user.

The Prisma schema models users, sessions, servers, memberships, invites, channels, messages, reactions, pinned messages, direct message threads, and direct message participants. SQLite keeps local development simple, while Prisma keeps the database layer portable.

## GitHub Readiness

This repo includes a `.gitignore` for common Next.js, Node.js, Prisma, environment, and OS artifacts. Before making the repository public, confirm that no real secrets, private data, production database files, or personal credentials are committed.

Recommended first commit:

```bash
git init -b main
git add .
git commit -m "Initial DollarCord release"
```

## License

No license file is included yet. Add a license before accepting outside contributions or publishing the project as open source.
