# GoOutNow 🏃‍♂️

**GoOutNow** is a location-based activity matching app that helps people discover and join local activities nearby — cricket, football, cycling, hiking, and more. Create an activity, set a location, and let others within 5km join you in real time.

---

## ✨ Features

- 📍 **Location-based discovery** — see activities within 5km of you on a live map
- 🏅 **Activity creation** — set title, type, date/time, location, and required player count
- 💬 **Per-activity real-time chat** — every activity has its own live chat powered by SSE
- 👥 **Player matching** — see how many spots are filled vs required (with progress bars)
- ⏰ **Urgency indicators** — countdown tags showing how many hours until each activity starts
- 📱 **Mobile-first responsive design** — works down to 300px wide with a chat drawer on mobile
- 🔐 **Unique player identities** — deterministic names and colors per user across all chats

---

## 🗂 Project Structure

```
gooutnow/
├── apps/
│   ├── api/               # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── post/  # Posts CRUD + nearby query
│   │   │   │   └── chat/  # Real-time chat via SSE
│   │   │   └── infrastructure/
│   │   │       └── database/  # Prisma service
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── web/               # React + Vite frontend
│       └── src/
│           ├── features/
│           │   └── posts/
│           │       ├── components/  # PostCard, CreatePostForm, PostChat, etc.
│           │       ├── hooks.ts
│           │       ├── forms.ts
│           │       └── types.ts
│           ├── routes/    # TanStack Router pages
│           ├── shared/    # Reusable UI components
│           └── lib/       # Utilities (chat-utils, etc.)
├── packages/              # Shared packages (if any)
├── docker-compose.yml     # PostgreSQL container
└── pnpm-workspace.yaml
```

---

## 🛠 Tech Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Backend     | NestJS · TypeScript · Prisma ORM             |
| Database    | PostgreSQL (Docker)                          |
| Frontend    | React 18 · Vite · TanStack Router/Query/Form |
| Styling     | Tailwind CSS                                 |
| Maps        | Leaflet · React-Leaflet                      |
| Real-time   | Server-Sent Events (SSE)                     |
| Validation  | Zod                                          |
| Icons       | Lucide React                                 |
| Package Mgr | pnpm (monorepo)                              |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd gooutnow
pnpm install
```

### 2. Start PostgreSQL

```bash
pnpm db:up
```

This spins up a PostgreSQL container via Docker Compose on port `5432`.

### 3. Run Migrations

```bash
pnpm db:migrate
```

Applies all Prisma migrations and sets up the schema.

### 4. Start Dev Servers

```bash
pnpm dev
```

This starts both the API and web app in parallel:

| Service | URL                   |
| ------- | --------------------- |
| API     | http://localhost:3000 |
| Web App | http://localhost:5173 |

---

## 📦 Available Scripts

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Start both API and web in dev mode    |
| `pnpm dev:api`     | Start API only                        |
| `pnpm dev:web`     | Start web app only                    |
| `pnpm build`       | Build both API and web for production |
| `pnpm db:up`       | Start PostgreSQL in Docker            |
| `pnpm db:down`     | Stop PostgreSQL container             |
| `pnpm db:migrate`  | Run Prisma migrations                 |
| `pnpm db:generate` | Regenerate Prisma client              |
| `pnpm db:studio`   | Open Prisma Studio (database GUI)     |
| `pnpm lint`        | Lint all packages                     |
| `pnpm format`      | Format all files with Prettier        |

---

## 🗄 Database Schema

### `posts`

| Column          | Type     | Description                      |
| --------------- | -------- | -------------------------------- |
| id              | String   | UUID primary key                 |
| title           | String   | Activity title                   |
| activityType    | String   | e.g., cricket, football, cycling |
| latitude        | Float    | Activity location (lat)          |
| longitude       | Float    | Activity location (lng)          |
| scheduledTime   | DateTime | When the activity starts         |
| requiredPlayers | Int      | How many players are needed      |
| createdById     | String   | Creator's user ID                |
| createdAt       | DateTime | Record creation time             |

### `post_members`

| Column   | Type     | Description      |
| -------- | -------- | ---------------- |
| id       | String   | UUID primary key |
| postId   | String   | FK → posts.id    |
| userId   | String   | Joined user's ID |
| joinedAt | DateTime | When they joined |

### `messages`

| Column    | Type     | Description           |
| --------- | -------- | --------------------- |
| id        | String   | UUID primary key      |
| postId    | String   | FK → posts.id         |
| userId    | String   | Message sender        |
| text      | String   | Message content       |
| createdAt | DateTime | When message was sent |

---

## 🔌 API Endpoints

### Posts

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| GET    | `/posts/nearby`      | Get posts within 5km of a location |
| GET    | `/posts/:id`         | Get a single post by ID            |
| POST   | `/posts`             | Create a new activity post         |
| POST   | `/posts/:id/join`    | Join an activity                   |
| GET    | `/posts/:id/members` | List members of an activity        |

**Query params for `/posts/nearby`:**

```
?latitude=13.08&longitude=80.27&userId=<uuid>
```

### Chat

| Method | Endpoint                 | Description                       |
| ------ | ------------------------ | --------------------------------- |
| GET    | `/chat/:postId/messages` | Fetch message history             |
| POST   | `/chat/:postId/messages` | Send a message                    |
| GET    | `/chat/:postId/stream`   | SSE stream for real-time messages |

---

## 🌐 Environment Variables

Create a `.env` file inside `apps/api/`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gooutnow"
PORT=3000
```

---

## 📱 Mobile Support

The app is fully responsive from **300px** upward:

- Activity cards go full-width on mobile
- Chat opens as a **slide-in drawer** on mobile (triggered by the chat button)
- Navigation wraps gracefully on small screens
- All forms are touch-friendly

---

## 🏗 Architecture

GoOutNow follows **Clean Architecture** with a **Feature-Based Modular** structure:

- **Backend**: Controller → Service → Repository → Prisma (Database)
- **Frontend**: Route → Feature Component → Custom Hook → API client
- Each feature (posts, chat) is self-contained with its own components, hooks, and types
- SOLID principles and typed async/await throughout

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT
