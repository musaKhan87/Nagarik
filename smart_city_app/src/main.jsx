import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './lib/theme';
import { AdminRoleProvider } from './lib/admin-role';
import { CoreProvider } from './context/CoreProvider';
import { Navbar } from './components/Navbar';
import { SiteFooter } from './components/SiteFooter';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Agentation } from "agentation";

// Import Pages
import { Home } from './pages/Home';
import { LoginRegister } from './pages/Login';
import { ReportIssue } from './pages/ReportIssue';
import { TrackComplaint } from './pages/TrackComplaint';
import { UpvoteFeed } from './pages/UpvoteFeed';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { RoleManagement } from './pages/RoleManagement';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

import './style.css';

function AppContent() {
  const location = useLocation();
  const path = location.pathname;
  const chromeless = path.startsWith("/admin") || path.startsWith("/worker") || path.startsWith("/users");

  if (chromeless) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['dept_admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/worker" element={
              <ProtectedRoute allowedRoles={['worker', 'super_admin']}>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <RoleManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        {path.startsWith("/worker") && <SiteFooter />}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/upvote" element={<UpvoteFeed />} />
          <Route path="/track/:id" element={<TrackComplaint />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["citizen", "super_admin"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {process.env.NODE_ENV === "development" && <Agentation />}
      <SiteFooter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      
    </BrowserRouter>
    
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AdminRoleProvider>
          <CoreProvider>
            <App />
          </CoreProvider>
        </AdminRoleProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
