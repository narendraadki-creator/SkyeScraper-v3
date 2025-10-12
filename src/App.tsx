import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoleBasedRedirect } from './components/auth/RoleBasedRedirect';
import { 
  AgentRoute, 
  DeveloperRoute, 
  AgentOrDeveloperRoute 
} from './components/auth/RoleBasedRoute';
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
      
      {/* Legacy route redirects */}
      <Route 
        path="/developer" 
        element={<Navigate to="/mobile/dev" replace />} 
      />
      <Route 
        path="/agent-projects" 
        element={<Navigate to="/mobile/agent" replace />} 
      />
      <Route 
        path="/admin" 
        element={<Navigate to="/mobile/admin" replace />} 
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