// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
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
import EditProfilePage from './pages/EditProfilePage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './index.css';
import './styles/DarkTheme.css'; // New: Import the Dark Theme CSS

const App = () => {
  // New: State to manage the theme. Defaults to light theme (false).
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // New: useEffect hook to apply the theme class to the body.
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkTheme]);

  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Navbar />
          <main className="content-wrapper">
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* Public Only Routes */}
              <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

              {/* Public routes for all users (e.g., viewing a thesis) */}
              <Route path="/thesis/:id" element={<ThesisDetailPage />} />

              {/* Protected Routes for all authenticated users */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/upload-thesis" element={<ProtectedRoute><UploadThesisPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

              {/* Admin/Supervisor Protected Routes */}
              <Route path="/admin-dashboard" element={<ProtectedRoute requiredRoles={['admin', 'supervisor']}><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/manage-users" element={<ProtectedRoute requiredRoles={['admin']}><ManageUsersPage /></ProtectedRoute>} />
            </Routes>
          </main>

          {/* New: A simple button to toggle the theme */}
          <button
            className="btn btn-secondary fixed-bottom m-3"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            style={{ width: '150px' }}
          >
            Switch to {isDarkTheme ? 'Light' : 'Dark'}
          </button>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;