import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ROLES } from './constants';

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const TransparencyWall = lazy(() => import('./pages/TransparencyWall'));
const PublicIssueDetail = lazy(() => import('./pages/PublicIssueDetail'));

// Citizen Pages
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const ReportIssue = lazy(() => import('./pages/citizen/ReportIssue'));
const MyIssues = lazy(() => import('./pages/citizen/MyIssues'));
const IssueDetail = lazy(() => import('./pages/citizen/IssueDetail'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));

// Road Authority Pages
const HeadAuthorityDashboard = lazy(() => import('./pages/authority_head/HeadAuthorityDashboard'));
const IssueManagement = lazy(() => import('./pages/authority_head/IssueManagement'));
const HeadAuthorityDepartments = lazy(() => import('./pages/authority_head/HeadAuthorityDepartments'));

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/transparency-wall" element={<TransparencyWall />} />
                <Route path="/issues/:id" element={<PublicIssueDetail />} />

                {/* Citizen Routes */}
                <Route
                  path="/citizen/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/report"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                      <ReportIssue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/my-issues"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                      <MyIssues />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/citizen/issue/:id"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.HEAD_AUTHORITY]}>
                      <IssueDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.HEAD_AUTHORITY]}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help-center"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                      <HelpCenterPage />
                    </ProtectedRoute>
                  }
                />

                {/* Head Authority Routes */}
                <Route
                  path="/head-authority/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.HEAD_AUTHORITY]}>
                      <HeadAuthorityDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/head-authority/management"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.HEAD_AUTHORITY]}>
                      <IssueManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/head-authority/departments"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.HEAD_AUTHORITY]}>
                      <HeadAuthorityDepartments />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
