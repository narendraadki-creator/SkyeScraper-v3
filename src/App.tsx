import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthTestPage } from './pages/AuthTestPage';
import { SimpleTestPage } from './pages/SimpleTestPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { UnitsPage } from './pages/UnitsPage';
import { UnitDetailsPage } from './pages/UnitDetailsPage';
import { LeadsPage } from './pages/LeadsPage';
import { AgentProjectsPage } from './pages/AgentProjectsPage';
import { CreateLeadPage } from './pages/CreateLeadPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminOrganizationsPage } from './pages/AdminOrganizationsPage';
import { AdminOrganizationDetailsPage } from './pages/AdminOrganizationDetailsPage';
import { AdminOrganizationEditPage } from './pages/AdminOrganizationEditPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminCreateProjectPage } from './pages/AdminCreateProjectPage';
import { AdminProjectEditPage } from './pages/AdminProjectEditPage';
import { AdminLeadsPage } from './pages/AdminLeadsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AuthDebugPage } from './pages/AuthDebugPage';
import { ClearAuthPage } from './pages/ClearAuthPage';
import { Loading } from './components/ui/Loading';

// Component to handle authentication routing
const AuthRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
      />
      <Route 
        path="/auth-test" 
        element={<AuthTestPage />} 
      />
      <Route 
        path="/test" 
        element={<SimpleTestPage />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/projects" 
        element={user ? <ProjectsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/projects/create" 
        element={user ? <CreateProjectPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/projects/:id" 
        element={user ? <ProjectDetailsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/projects/:projectId/units" 
        element={user ? <UnitsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/projects/:projectId/units/:unitId" 
        element={user ? <UnitDetailsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/leads" 
        element={user ? <LeadsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/agent-projects" 
        element={user ? <AgentProjectsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/leads/create/:projectId" 
        element={user ? <CreateLeadPage /> : <Navigate to="/login" replace />} 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={user ? <AdminDashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/organizations" 
        element={user ? <AdminOrganizationsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/organizations/:organizationId" 
        element={user ? <AdminOrganizationDetailsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/organizations/:organizationId/edit" 
        element={user ? <AdminOrganizationEditPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/projects" 
        element={user ? <AdminProjectsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/projects/create" 
        element={user ? <AdminCreateProjectPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/projects/:projectId/edit" 
        element={user ? <AdminProjectEditPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/leads" 
        element={user ? <AdminLeadsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/analytics" 
        element={user ? <AdminAnalyticsPage /> : <Navigate to="/login" replace />} 
      />
      
      <Route 
        path="/auth-debug" 
        element={user ? <AuthDebugPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/clear-auth" 
        element={<ClearAuthPage />} 
      />
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AuthRouter />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;