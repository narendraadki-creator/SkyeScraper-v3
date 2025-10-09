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
import { ProjectEditPage } from './pages/ProjectEditPage';
import { UnitsPage } from './pages/UnitsPage';
import { UnitDetailsPage } from './pages/UnitDetailsPage';
import { LeadsPage } from './pages/LeadsPage';
import { AgentProjectsPage } from './pages/AgentProjectsPage';
import { CreateLeadPage } from './pages/CreateLeadPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminOrganizationsPage } from './pages/AdminOrganizationsPage';
import { AdminOrganizationDetailsPage } from './pages/AdminOrganizationDetailsPage';
import { AdminOrganizationEditPage } from './pages/AdminOrganizationEditPage';
import { RoleBasedRedirect } from './components/auth/RoleBasedRedirect';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminCreateProjectPage } from './pages/AdminCreateProjectPage';
import { AdminProjectEditPage } from './pages/AdminProjectEditPage';
import { AdminLeadsPage } from './pages/AdminLeadsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AuthDebugPage } from './pages/AuthDebugPage';
import { ClearAuthPage } from './pages/ClearAuthPage';
import { MobileAgentPage } from './pages/MobileAgentPage';
import { MobileDeveloperDashboardPage } from './pages/MobileDeveloperDashboardPage';
import { MobileProjectEditPage } from './pages/MobileProjectEditPage';
import { MobileProjectUnitsPage } from './pages/MobileProjectUnitsPage';
import { MobileDeveloperProjectDetailsPage } from './pages/MobileDeveloperProjectDetailsPage';
import { MobileTestPage } from './pages/MobileTestPage';
import { MobileLeadsPageWrapper } from './pages/MobileLeadsPage';
import { MobileLeadDetailsPageWrapper } from './pages/MobileLeadDetailsPage';
import { MobileCreateLeadPageWrapper } from './pages/MobileCreateLeadPage';
import { MobileSettingsPageWrapper } from './pages/MobileSettingsPage';
import { MobileProfilePageWrapper } from './pages/MobileProfilePage';
import { MobileSecurityPageWrapper } from './pages/MobileSecurityPage';
import { MobileNotificationsPageWrapper } from './pages/MobileNotificationsPage';
import { MobileLanguagePageWrapper } from './pages/MobileLanguagePage';
import { DeveloperHomePageWrapper } from './pages/DeveloperHomePage';
import { PropertyDetailsPageWrapper } from './pages/PropertyDetailsPage';
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
        element={user ? <RoleBasedRedirect /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={user ? <RoleBasedRedirect /> : <RegisterPage />} 
      />
      <Route 
        path="/auth-test" 
        element={<AuthTestPage />} 
      />
      <Route 
        path="/test" 
        element={<SimpleTestPage />} 
      />
      <Route 
        path="/mobile-test" 
        element={<MobileTestPage />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/developer" 
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
        path="/projects/:id/edit" 
        element={user ? <ProjectEditPage /> : <Navigate to="/login" replace />} 
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
      
      {/* Mobile Routes */}
      <Route 
        path="/mobile/agent" 
        element={user ? <MobileAgentPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/developer" 
        element={user ? <MobileDeveloperDashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/developer/project/:projectId" 
        element={user ? <MobileDeveloperProjectDetailsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/developer/project/:id/edit" 
        element={user ? <MobileProjectEditPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/developer/project/:projectId/units" 
        element={user ? <MobileProjectUnitsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/leads" 
        element={user ? <MobileLeadsPageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/leads/:leadId" 
        element={user ? <MobileLeadDetailsPageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/leads/create/:projectId" 
        element={user ? <MobileCreateLeadPageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/settings" 
        element={user ? <MobileSettingsPageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/profile" 
        element={user ? <MobileProfilePageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/security" 
        element={user ? <MobileSecurityPageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/notifications" 
        element={user ? <MobileNotificationsPageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/mobile/language" 
        element={user ? <MobileLanguagePageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/developer/:developerId" 
        element={user ? <DeveloperHomePageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/project/:projectId" 
        element={user ? <PropertyDetailsPageWrapper /> : <Navigate to="/login" replace />} 
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
        element={user ? <RoleBasedRedirect /> : <Navigate to="/login" replace />} 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={user ? <RoleBasedRedirect /> : <Navigate to="/login" replace />} 
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