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
import CreatePromotionPage from './pages/CreatePromotionPage';
import DeveloperPromotionsPage from './pages/DeveloperPromotionsPage';
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
import { 
  RoleBasedRoute, 
  AgentRoute, 
  DeveloperRoute, 
  AdminRoute, 
  DeveloperOrAdminRoute, 
  AgentOrDeveloperRoute 
} from './components/auth/RoleBasedRoute';
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
import { MobileAgentPromotionsPage } from './pages/MobileAgentPromotionsPage';
import { MobileDeveloperPromotionsPage } from './pages/MobileDeveloperPromotionsPage';
import { MobileDeveloperSettingsPageWrapper } from './pages/MobileDeveloperSettingsPage';
import { MobileAgentProjectEditPage } from './pages/MobileAgentProjectEditPage';
import { MobileAgentUnitsPage } from './pages/MobileAgentUnitsPage';
import { MobileDeveloperLeadsPageWrapper } from './pages/MobileDeveloperLeadsPage';
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
        element={<MobileAgentPromotionsPage />} 
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
        path="/promotions/create" 
        element={user ? <CreatePromotionPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/promotions" 
        element={user ? <DeveloperPromotionsPage /> : <Navigate to="/login" replace />} 
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
      
      {/* Mobile Routes - Role-Based Protection */}
      
      {/* Agent Routes - Only accessible by agents */}
      <Route 
        path="/mobile/agent" 
        element={
          user ? (
            <AgentRoute>
              <MobileAgentPage />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/leads" 
        element={
          user ? (
            <AgentRoute>
              <MobileLeadsPageWrapper />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/promotion" 
        element={
          user ? (
            <AgentRoute>
              <MobileAgentPromotionsPage />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/settings" 
        element={
          user ? (
            <AgentRoute>
              <MobileSettingsPageWrapper />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/project/:projectId" 
        element={
          user ? (
            <AgentRoute>
              <PropertyDetailsPageWrapper />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/leads/create/:projectId" 
        element={
          user ? (
            <AgentRoute>
              <MobileCreateLeadPageWrapper />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/developer/:developerId" 
        element={
          user ? (
            <AgentRoute>
              <DeveloperHomePageWrapper />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/project/:id/edit" 
        element={
          user ? (
            <AgentRoute>
              <MobileAgentProjectEditPage />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/agent/project/:projectId/units" 
        element={
          user ? (
            <AgentRoute>
              <MobileAgentUnitsPage />
            </AgentRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      {/* Developer Routes - Only accessible by developers */}
      <Route 
        path="/mobile/dev" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileDeveloperDashboardPage />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/promotion" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileDeveloperPromotionsPage />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/settings" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileDeveloperSettingsPageWrapper key="dev-settings" />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/project/:projectId" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileDeveloperProjectDetailsPage />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/project/:id/edit" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileProjectEditPage />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/project/:projectId/units" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileProjectUnitsPage />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/leads" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileDeveloperLeadsPageWrapper />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/leads/:leadId" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileLeadDetailsPageWrapper />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/dev/leads/create/:projectId" 
        element={
          user ? (
            <DeveloperRoute>
              <MobileCreateLeadPageWrapper />
            </DeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
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
      {/* Shared Routes - Accessible by both agents and developers */}
      <Route 
        path="/mobile/profile" 
        element={
          user ? (
            <AgentOrDeveloperRoute>
              <MobileProfilePageWrapper />
            </AgentOrDeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/security" 
        element={
          user ? (
            <AgentOrDeveloperRoute>
              <MobileSecurityPageWrapper key="security" />
            </AgentOrDeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/notifications" 
        element={
          user ? (
            <AgentOrDeveloperRoute>
              <MobileNotificationsPageWrapper />
            </AgentOrDeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/mobile/language" 
        element={
          user ? (
            <AgentOrDeveloperRoute>
              <MobileLanguagePageWrapper />
            </AgentOrDeveloperRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/developer/:developerId" 
        element={user ? <DeveloperHomePageWrapper /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/project/:projectId" 
        element={user ? <PropertyDetailsPageWrapper /> : <Navigate to="/login" replace />} 
      />
      
      {/* Admin Routes - Only accessible by admins */}
      <Route 
        path="/admin" 
        element={
          user ? (
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/organizations" 
        element={
          user ? (
            <AdminRoute>
              <AdminOrganizationsPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/organizations/:organizationId" 
        element={
          user ? (
            <AdminRoute>
              <AdminOrganizationDetailsPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/organizations/:organizationId/edit" 
        element={
          user ? (
            <AdminRoute>
              <AdminOrganizationEditPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/projects" 
        element={
          user ? (
            <AdminRoute>
              <AdminProjectsPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/projects/create" 
        element={
          user ? (
            <AdminRoute>
              <AdminCreateProjectPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/projects/:projectId/edit" 
        element={
          user ? (
            <AdminRoute>
              <AdminProjectEditPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/leads" 
        element={
          user ? (
            <AdminRoute>
              <AdminLeadsPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          user ? (
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
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