import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

import Landing from './pages/public/Landing';
import About from './pages/public/About';
import Pricing from './pages/public/Pricing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/app/Dashboard';
import Chat from './pages/app/Chat';
import CodeGenerator from './pages/app/CodeGenerator';
import DebugAssistant from './pages/app/DebugAssistant';
import Notes from './pages/app/Notes';
import Profile from './pages/app/Profile';
import Settings from './pages/app/Settings';
import Billing from './pages/app/Billing';
import VoiceAssistant from './pages/app/VoiceAssistant';
import FileAnalyzer from './pages/app/FileAnalyzer';
import ProjectGenerator from './pages/app/ProjectGenerator';
import WorkspaceOS from './pages/app/WorkspaceOS';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';

import CustomCursor from './components/ui/CustomCursor';
import BackgroundEffects from './components/background/BackgroundEffects';
import CommandPalette from './components/ui/CommandPalette';

export default function App() {
  const { token, loadUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadUser();
      import('./services/api').then(({ settingsAPI }) => {
        settingsAPI.get().then(({ data }) => {
          if (data?.settings?.appearance?.theme) {
            const t = data.settings.appearance.theme === 'Hologram Blue' ? 'hologram' : 'cyberpunk';
            document.body.className = t;
          }
        }).catch(() => {});
      });
    }
  }, [token, loadUser]);

  return (
    <>
      <CustomCursor />
      <BackgroundEffects />
      <CommandPalette />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="code-generator" element={<CodeGenerator />} />
        <Route path="debug" element={<DebugAssistant />} />
        <Route path="project-generator" element={<ProjectGenerator />} />
        <Route path="file-analyzer" element={<FileAnalyzer />} />
        <Route path="notes" element={<Notes />} />
        <Route path="voice" element={<VoiceAssistant />} />
        <Route path="profile" element={<Profile />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
        <Route path="workspace/:workspaceId" element={<WorkspaceOS />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
