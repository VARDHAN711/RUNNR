# RUNNR — Task Marketplace

RUNNR is a full-stack task marketplace application built with **TypeScript** end-to-end. Customers can post tasks, freelancers can browse and bid on them, and both parties manage the complete task lifecycle — from posting through assignment, completion flagging, and final confirmation — with in-app notifications at every step.

---

## 🚀 Features

### For Customers
- **Post Tasks** — Create tasks with title, description, location, base price, and deadline.
- **Task Dashboard** — View all posted tasks sorted by date; track open, assigned, pending, completed, and cancelled tasks.
- **Task Management** — Edit or delete open tasks; cancel tasks at any lifecycle stage (except completed/cancelled).
- **Review Requests** — View all freelancer accept-requests for a task, including freelancer profiles and computed total price.
- **Accept / Reject Requests** — Accept one request (auto-rejects all others and marks the task as *assigned*); reject individual requests.
- **Confirm Completion** — When a freelancer flags a task as done, confirm the completion to finalise the task.
- **Profile Management** — View and update personal profile (name, phone).

### For Freelancers
- **Browse Open Tasks** — Explore all available marketplace tasks with customer details.
- **Task Detail View** — View full task details before deciding to request.
- **Send Accept Requests** — Submit a request to work on a task, optionally adding a top-up amount (0–200).
- **My Requests** — Track the status of all submitted requests across tasks.
- **My Tasks** — View tasks currently assigned to the freelancer (assigned, pending, completed).
- **Flag Task as Done** — Mark an assigned task as complete, which notifies the customer to confirm.
- **Withdraw from Task** — Withdraw from an assigned task, reopening it to the marketplace.
- **Profile Management** — View and update personal profile (name, phone, skills).

### Shared
- **In-App Notifications** — Real-time lifecycle alerts (task assigned, freelancer withdrawn, task cancelled, completion flagged, completion confirmed). Unread badge shown in the navbar.
- **Mark Notifications as Read** — View and dismiss individual notifications.
- **Role-Based Access Control** — Every route is protected via JWT middleware; role checks are enforced at the controller level.

---

## 🛠️ Technology Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js 4 |
| Language | TypeScript 5 |
| Database | MongoDB (Mongoose ODM 8) |
| Authentication | JWT (`jsonwebtoken`) + bcryptjs |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Dev Server | ts-node-dev |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| HTTP Client | Axios 1 (with request & response interceptors) |
| Form Handling | React Hook Form + Zod validation |
| Schema Validation | Zod (runtime API response validation via interceptors) |
| Icons | Lucide React |
| State Management | React Context API (`AuthContext`) |

### CI/CD
| Tool | Purpose |
|---|---|
| Jenkins | Pipeline orchestration (Windows agents using `bat`) |
| Node.js 20 | Parallel installs, lint, type-check, test, build stages |
| ESLint + TSC | Code quality gates |
| Vite Build | Production bundle; artifacts archived per build |

---

## 📁 Project Structure

```text
RUNNR/
├── Jenkinsfile                    # CI/CD pipeline definition
├── README.md
│
├── backend/                       # Express + TypeScript API
│   ├── index.ts                   # Server entry point (Express setup, MongoDB, routes)
│   ├── config.ts                  # App configuration
│   ├── swagger.ts                 # Swagger/OpenAPI spec setup
│   ├── tsconfig.json
│   ├── package.json
│   │
│   ├── controllers/               # Business logic
│   │   ├── authController.ts      # signup, login
│   │   ├── taskController.ts      # CRUD + lifecycle actions (withdraw, cancel, flag-done, confirm)
│   │   ├── requestController.ts   # send, accept, reject, list requests
│   │   ├── notificationController.ts  # get, unread-count, markAsRead
│   │   └── userController.ts      # getProfile, updateProfile
│   │
│   ├── models/                    # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   ├── AcceptRequest.ts
│   │   └── Notification.ts
│   │
│   ├── routes/                    # Express routers
│   │   ├── authRoutes.ts          # POST /api/auth/signup, /login
│   │   ├── taskRoutes.ts          # /api/tasks (+ nested request routes)
│   │   ├── requestRoutes.ts       # /api/tasks/:taskId/requests
│   │   ├── notificationRoutes.ts  # /api/notifications
│   │   └── userRoutes.ts          # /api/users/profile
│   │
│   ├── middleware/
│   │   └── authMiddleware.ts      # JWT verification, attaches req.user
│   │
│   └── types/
│       ├── enums.ts               # UserRole, TaskStatus, RequestStatus, NotificationType
│       ├── interfaces.ts          # IUser, ITask, IAcceptRequest, INotification, DTOs
│       └── express.d.ts           # Express Request augmentation (req.user)
│
└── frontend/                      # React + TypeScript SPA
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── eslint.config.js
    ├── package.json
    │
    └── src/
        ├── main.tsx               # App entry, AuthProvider wrapper
        ├── App.tsx                # Route definitions (public + role-protected)
        ├── index.css              # Global styles
        ├── vite-env.d.ts
        │
        ├── api/
        │   └── axiosInstance.ts   # Axios with JWT interceptor + Zod response validation
        │
        ├── context/
        │   └── AuthContext.tsx    # Auth state (token, role, userId) + login/logout
        │
        ├── types/
        │   ├── index.ts           # Enums, interfaces, populated types
        │   └── schemas.ts         # Zod schemas for API validation
        │
        ├── utils/
        │   └── helpers.ts         # Shared utility functions
        │
        ├── components/            # Reusable UI components
        │   ├── Navbar.tsx         # Top nav with unread notification badge
        │   ├── ProtectedRoute.tsx # Route guard (checks auth + optional role)
        │   ├── TaskCard.tsx       # Task summary card component
        │   ├── StatusBadge.tsx    # Coloured badge for task/request status
        │   ├── ConfirmModal.tsx   # Generic confirmation dialog
        │   ├── LoadingSpinner.tsx
        │   └── ErrorMessage.tsx
        │
        └── pages/
            ├── NotificationsPage.tsx    # Shared: notification list + mark-as-read
            ├── ProfilePage.tsx          # Shared: view/edit profile with Zod validation
            │
            ├── auth/
            │   ├── RoleSelectionPage.tsx    # Landing — choose Customer or Freelancer
            │   ├── CustomerSignup.tsx
            │   ├── CustomerLogin.tsx
            │   ├── FreelancerSignup.tsx
            │   └── FreelancerLogin.tsx
            │
            ├── customer/
            │   ├── CustomerDashboard.tsx    # All tasks posted by the customer
            │   ├── PostTaskPage.tsx         # Create / edit task form
            │   ├── CustomerTaskDetail.tsx   # Task detail: edit, cancel, confirm completion
            │   └── AcceptRequestsPage.tsx   # Review & accept/reject freelancer requests
            │
            └── freelancer/
                ├── FreelancerDashboard.tsx  # Browse open marketplace tasks
                ├── FreelancerTaskDetail.tsx # Task detail: request, flag-done, withdraw
                └── MyTasksPage.tsx          # Assigned / completed tasks for the freelancer
```

---

## 🗄️ Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Optional |
| `email` | String | Unique, required |
| `password` | String | Bcrypt hashed |
| `phone` | String | Required |
| `role` | `customer` \| `freelancer` | Required |
| `skills` | String \| null | Freelancers only |
| `employeeId` | String | Optional |
| `createdAt` | Date | Auto |

### Task
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `customerId` | ObjectId → User | Required |
| `title` | String | Required |
| `description` | String | Required |
| `location` | String | Required |
| `basePrice` | Number | ≥ 0, required |
| `deadline` | Date | Required |
| `postedDate` | Date | Defaults to `Date.now` |
| `status` | enum | `open` → `assigned` → `pending` → `completed` \| `cancelled` |
| `assignedFreelancerId` | ObjectId → User | Nullable |
| `isDoneFlagged` | Boolean | Set when freelancer flags done |

### AcceptRequest
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `taskId` | ObjectId → Task | Required |
| `freelancerId` | ObjectId → User | Required |
| `topUpAmount` | Number | 0–200, default 0 |
| `status` | enum | `pending` \| `accepted` \| `rejected` |
| `createdAt` | Date | Auto |

### Notification
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `recipientId` | ObjectId → User | Required |
| `message` | String | Required |
| `type` | enum | `status_update` \| `system` |
| `isRead` | Boolean | Default `false` |
| `taskId` | ObjectId → Task | Optional reference |
| `createdAt` | Date | Auto |

---

## 🔌 API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/signup` | Public | Register a new user |
| `POST` | `/login` | Public | Authenticate and receive a JWT |

### Tasks — `/api/tasks`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Customer | Create a new task |
| `GET` | `/` | Freelancer | List all open tasks |
| `GET` | `/my-tasks` | Customer | List all tasks posted by the customer |
| `GET` | `/freelancer-tasks` | Freelancer | List tasks assigned to the freelancer |
| `GET` | `/my-requests` | Freelancer | List all requests submitted by the freelancer |
| `GET` | `/received-requests` | Customer | List all requests received across customer's tasks |
| `GET` | `/:id` | Authenticated | Get task by ID (open: any user; assigned/completed: owner or assignee) |
| `PUT` | `/:id` | Customer (owner) | Update an open task |
| `DELETE` | `/:id` | Customer (owner) | Delete an open task (also removes associated requests) |
| `PATCH` | `/:id/status` | Customer (owner) | Mark an assigned task as completed |
| `PATCH` | `/:id/withdraw` | Freelancer (assignee) | Withdraw from an assigned task → reopens it |
| `PATCH` | `/:id/cancel` | Customer (owner) | Cancel a task (not already completed/cancelled) |
| `PATCH` | `/:id/flag-done` | Freelancer (assignee) | Flag task as done → status becomes `pending` |
| `PATCH` | `/:id/confirm-completion` | Customer (owner) | Confirm completion → status becomes `completed` |

### Accept Requests — `/api/tasks/:taskId/requests`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Freelancer | Submit an accept-request (with optional `topUpAmount`) |
| `GET` | `/` | Customer (owner) | List all requests for a task (with `totalPrice` computed) |
| `PATCH` | `/:requestId/accept` | Customer (owner) | Accept a request; rejects all others; assigns task |
| `PATCH` | `/:requestId/reject` | Customer (owner) | Reject a specific request |
| `GET` | `/my-request` | Freelancer | Get the freelancer's own request for a task |

### Notifications — `/api/notifications`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Authenticated | Get all notifications for the current user (sorted newest first) |
| `GET` | `/unread-count` | Authenticated | Get count of unread notifications |
| `PATCH` | `/:id/read` | Authenticated (owner) | Mark a notification as read |

### Users — `/api/users`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profile` | Authenticated | Get current user's profile (password excluded) |
| `PATCH` | `/profile` | Authenticated | Update name, phone; skills update restricted to freelancers |

### Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | API health check |

📖 **Interactive Swagger UI**: `http://localhost:5000/api/docs`

---

## 🔔 Notification Triggers

| Event | Recipient | Message |
|---|---|---|
| Freelancer withdraws from task | Customer | `"The assigned freelancer has withdrawn from your task: '…'. It is now open again."` |
| Customer cancels task (with assignee) | Freelancer | `"The customer has cancelled the task: '…'."` |
| Freelancer flags task as done | Customer | `"Freelancer has completed the work for task: '…'. Please confirm completion."` |
| Customer confirms completion | Freelancer | `"The customer has confirmed your work and finalized task: '…'."` |

---

## ⚙️ Setup & Running Locally

### Prerequisites
- **Node.js** v20+
- **MongoDB** (local instance or MongoDB Atlas)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the development server (with hot reload via `ts-node-dev`):

```bash
npm run dev
```

| URL | Description |
|---|---|
| `http://localhost:5000/api` | REST API base URL |
| `http://localhost:5000/api/health` | Health check |
| `http://localhost:5000/api/docs` | Swagger UI |

Build for production:

```bash
npm run build    # Compiles TypeScript to dist/
npm run start    # Runs compiled output
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **`http://localhost:5173`**.

Other scripts:

```bash
npm run build        # Production Vite build → frontend/dist/
npm run type-check   # TypeScript type checking (no emit)
npm run lint         # ESLint
npm run preview      # Preview production build locally
```

> The frontend uses the `@/` path alias (mapped to `src/`) via `vite.config.js` and `tsconfig.json`.

---

## 🚢 CI/CD Pipeline (Jenkins)

The `Jenkinsfile` defines a declarative pipeline for Windows build agents:

| Stage | Description |
|---|---|
| **Checkout** | Pulls source code from SCM |
| **Install Dependencies** | Parallel: `npm ci` (backend) + `npm install --legacy-peer-deps` (frontend) |
| **Lint** | Parallel: backend lint, frontend ESLint, frontend TypeScript type-check |
| **Test** | Parallel: backend and frontend unit tests (skipped gracefully if not configured) |
| **Build** | Parallel: Vite production build (frontend) + `node -c` syntax check (backend) |
| **Docker Build** | Skipped (no Dockerfile present yet) |
| **Deploy - Staging** | Triggered on `develop` branch (placeholder) |
| **Deploy - Production** | Triggered on `main` branch (placeholder) |

Post-build actions: archives `frontend/dist/**` as build artifacts, cleans workspace.

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** before storage — plain text is never persisted.
- JWTs are signed with `JWT_SECRET` and verified on every protected route via `authMiddleware`.
- Role checks are enforced at the **controller level** (not just route level) for defence in depth.
- The frontend attaches the JWT via an **Axios request interceptor** (`Authorization: Bearer <token>`).
- API responses are validated at runtime using **Zod schemas** in the Axios response interceptor, catching shape mismatches without breaking the UI.
- Sensitive task details (assigned/completed tasks) are only accessible to the task owner or the assigned freelancer.