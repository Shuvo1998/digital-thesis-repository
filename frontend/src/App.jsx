// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadThesisPage from './pages/UploadThesisPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ThesisDetailPage from './pages/ThesisDetailPage';
import ManageUsersPage from './pages/ManageUsersPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage'; // NEW: Import EditProfilePage
import ErrorBoundary from './components/ErrorBoundary';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './index.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Navbar />
          <main className="py-4">
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* Public Only Routes */}
              <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

              {/* Protected Routes for all authenticated users */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadThesisPage /></ProtectedRoute>} />
              <Route path="/thesis/:id" element={<ProtectedRoute><ThesisDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              {/* NEW: Route for the Edit Profile Page */}
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

              {/* Admin/Supervisor Protected Routes */}
              <Route path="/admin-dashboard" element={<ProtectedRoute requiredRoles={['admin', 'supervisor']}><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/manage-users" element={<ProtectedRoute requiredRoles={['admin']}><ManageUsersPage /></ProtectedRoute>} />
            </Routes>
          </main>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;