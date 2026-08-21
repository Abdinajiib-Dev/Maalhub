import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import EntrepreneurDashboard from './pages/Entrepreneur/Dashboard';
import CreateProject from './pages/Entrepreneur/CreateProject';
import MyProjects from './pages/Entrepreneur/MyProjects';
import InvestorDashboard from './pages/Investor/Dashboard';
import InvestmentRequests from './pages/Shared/InvestmentRequests';
import Messages from './pages/Shared/Messages';
import Placeholder from './pages/Shared/Placeholder';
import ExploreProjects from './pages/Investor/ExploreProjects';
import Profile from './pages/Shared/Profile';
import Settings from './pages/Shared/Settings';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
        {/* Public Routes with Standard Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="projects/:id" element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          } />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Dashboard Routes with DashboardLayout */}
        <Route element={<DashboardLayout />}>
          {/* Protected Entrepreneur Routes */}
          <Route path="entrepreneur" element={
            <ProtectedRoute allowedRole="entrepreneur">
              <Outlet />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<EntrepreneurDashboard />} />
            <Route path="create-project" element={<CreateProject />} />
            <Route path="projects" element={<MyProjects />} />
            <Route path="requests" element={<InvestmentRequests />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Protected Investor Routes */}
          <Route path="investor" element={
            <ProtectedRoute allowedRole="investor">
              <Outlet />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<InvestorDashboard />} />
            <Route path="projects" element={<ExploreProjects />} />
            <Route path="requests" element={<InvestmentRequests />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
