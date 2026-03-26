import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout & Context
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import CustomerSignup from './pages/auth/CustomerSignup';
import CustomerLogin from './pages/auth/CustomerLogin';
import FreelancerSignup from './pages/auth/FreelancerSignup';
import FreelancerLogin from './pages/auth/FreelancerLogin';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PostTaskPage from './pages/customer/PostTaskPage';
import CustomerTaskDetail from './pages/customer/CustomerTaskDetail';
import AcceptRequestsPage from './pages/customer/AcceptRequestsPage';

// Freelancer Pages
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import FreelancerTaskDetail from './pages/freelancer/FreelancerTaskDetail';
import MyTasksPage from './pages/freelancer/MyTasksPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/customer/signup" element={<CustomerSignup />} />
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/freelancer/signup" element={<FreelancerSignup />} />
            <Route path="/freelancer/login" element={<FreelancerLogin />} />

            {/* Customer Protected Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute role="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/post-task"
              element={
                <ProtectedRoute role="customer">
                  <PostTaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/tasks/:id"
              element={
                <ProtectedRoute role="customer">
                  <CustomerTaskDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/tasks/:id/requests"
              element={
                <ProtectedRoute role="customer">
                  <AcceptRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Freelancer Protected Routes */}
            <Route
              path="/freelancer/dashboard"
              element={
                <ProtectedRoute role="freelancer">
                  <FreelancerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/tasks/:id"
              element={
                <ProtectedRoute role="freelancer">
                  <FreelancerTaskDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/my-tasks"
              element={
                <ProtectedRoute role="freelancer">
                  <MyTasksPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
