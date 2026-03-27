# Runnr - Task Marketplace

Runnr is a full-stack task marketplace application where customers can post tasks and freelancers can bid/request to work on them. It features a role-based dashboard, secure authentication, and a real-time request management system.

## 🚀 Features

### For Customers
- **Post Tasks:** Easily create tasks with title, description, and budget.
- **Manage Requests:** View and accept requests from freelancers for posted tasks.
- **Task Dashboard:** Track all posted and active tasks.
- **Role-based Experience:** Tailored interface for managing outsourced work.

### For Freelancers
- **Browse Tasks:** Explore available "Open" tasks in the marketplace.
- **Bidding System:** Request to work on tasks with a single click.
- **Freelancer Dashboard:** View requested and assigned tasks.
- **My Tasks:** Dedicated view for ongoing and completed assignments.

## 🛠️ Technical Stack

### Frontend
- **Framework:** React with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **State Management:** React Context API (Auth)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) & Bcryptjs
- **Documentation:** Swagger (OpenAPI)
- **Middleware:** CORS, Express JSON parser

## 📁 Project Structure

```text
RUNNR/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth context for state management
│   │   ├── pages/      # Role-specific pages (Auth, Customer, Freelancer)
│   │   └── App.jsx     # Main application routing
├── backend/            # Express backend API
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth and validation middleware
│   └── index.js        # Server entry point
└── README.md           # Project documentation
```

## ⚙️ Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your MongoDB URI and JWT Secret:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`.
   API Documentation is available at `http://localhost:5000/api/docs`.

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.