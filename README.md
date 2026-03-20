# Trafikverket Digital Escape Room

A browser-based digital escape room built for Trafikverket, offering two separate tracks — **Gymnasium** and **Högskola** — each with 7 mini-games covering topics such as traffic safety, network architecture, coding puzzles, and digital security.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v7 |
| Backend | ASP.NET Core (.NET 8), EF Core |
| Database | PostgreSQL 16 (via Docker) |
| Drag & drop | @dnd-kit |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) (for the database)

---

## Getting Started

### 1. Start the database

```bash
docker compose -f docker/docker-compose.yml up -d
```

This spins up a PostgreSQL 16 container on port **5432** with:

| Setting | Value |
|---|---|
| Database | `escape_room` |
| Username | `escape` |
| Password | `escape` |

### 2. Run everything at once (recommended)

A convenience script starts the database, backend, and frontend together:

```bash
./run-dev.sh
```

### 3. Run services individually

**Backend** — applies migrations and seeds data on startup:

```bash
cd backend/EscapeRoom.Api
dotnet run
```

The API will be available at `http://localhost:5000` (or as configured in `launchSettings.json`).  
Swagger UI is available at `http://localhost:5000/swagger`.

**Frontend:**

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
escapeRoom/
├── backend/
│   └── EscapeRoom.Api/
│       ├── Controllers/        # REST API endpoints
│       ├── Domain/             # Domain models (Game, Challenge, Mode, etc.)
│       ├── Infrastructure/     # EF Core DbContext, seeder, migrations
│       └── Program.cs
├── docker/
│   └── docker-compose.yml      # PostgreSQL service
├── src/
│   ├── admin/                  # Admin dashboard (manage games, leaderboard, content)
│   ├── components/             # Shared React components
│   ├── config/                 # API base URL config
│   ├── minigames/
│   │   ├── gymnasiumGames/     # 7 mini-games for Gymnasium track
│   │   ├── hogskolaGames/      # 7 mini-games for Högskola track
│   │   └── shared/             # Shared mini-game components
│   ├── pages/                  # Top-level pages (SelectPage, WelcomePage, etc.)
│   ├── styles/                 # Global CSS
│   └── utils/                  # Navigation helpers
├── public/                     # Static assets (fonts, images, sounds)
├── vite.config.js
└── package.json
```

---

## Routes

| Path | Description |
|---|---|
| `/` | Main menu — choose Gymnasium or Högskola |
| `/gymnasium` | Welcome screen for the Gymnasium track |
| `/gymnasium/<GameName>` | Individual Gymnasium mini-games |
| `/gymnasium/leaderboard` | Leaderboard for Gymnasium |
| `/hogskola` | Welcome screen for the Högskola track |
| `/hogskolaGames/Game<N>` | Individual Högskola mini-games (1–7) |
| `/admin` | Admin dashboard |
| `/admin/EditChallenge/:gameId` | Edit challenge content |
| `/admin/hogskola-info` | Edit post-game info text for Högskola games |
| `/admin/leaderboard` | Admin leaderboard management |
| `/admin/gallery` | Image gallery |

---

## Admin Panel

Navigate to `/admin` to manage game content without touching code:

- Enable/disable individual games
- Edit challenge text, options, and correct answers
- Update the post-game info paragraphs shown after each Högskola mini-game
- View and manage leaderboard entries

---

## Environment / Configuration

Backend connection string is configured in `backend/EscapeRoom.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=escape_room;Username=escape;Password=escape"
  }
}
```

Frontend API base URL is set in `src/config/apiBase.js`.

---

## Database Migrations

Migrations are applied automatically on startup. To add a new migration manually:

```bash
cd backend/EscapeRoom.Api
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

