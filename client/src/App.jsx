import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Dynamic route split loading for public modules
const Landing = lazy(() => import('./pages/public/Landing'));
const About = lazy(() => import('./pages/public/About'));
const Pricing = lazy(() => import('./pages/public/Pricing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Dynamic route split loading for app workspace modules
const Dashboard = lazy(() => import('./pages/app/Dashboard'));
const Chat = lazy(() => import('./pages/app/Chat'));
const CodeGenerator = lazy(() => import('./pages/app/CodeGenerator'));
const DebugAssistant = lazy(() => import('./pages/app/DebugAssistant'));
const Notes = lazy(() => import('./pages/app/Notes'));
const Profile = lazy(() => import('./pages/app/Profile'));
const Settings = lazy(() => import('./pages/app/Settings'));
const Billing = lazy(() => import('./pages/app/Billing'));
const VoiceAssistant = lazy(() => import('./pages/app/VoiceAssistant'));
const FileAnalyzer = lazy(() => import('./pages/app/FileAnalyzer'));
const ProjectGenerator = lazy(() => import('./pages/app/ProjectGenerator'));
const WorkspaceOS = lazy(() => import('./pages/app/WorkspaceOS'));
const BrainCore = lazy(() => import('./pages/app/BrainCore'));

// Dynamic route split loading for administration modules
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

import CustomCursor from './components/ui/CustomCursor';
import BackgroundEffects from './components/background/BackgroundEffects';
import CommandPalette from './components/ui/CommandPalette';

export default function App() {
  const { token, loadUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.ctrlKey && e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'h') {
          e.preventDefault();
          navigate('/app/dashboard');
        } else if (key === 'c') {
          e.preventDefault();
          navigate('/app/chat');
        } else if (key === 'b') {
          e.preventDefault();
          navigate('/app/brain');
        } else if (key === 'v') {
          e.preventDefault();
          navigate('/app/voice');
        } else if (key === 's') {
          e.preventDefault();
          navigate('/app/settings');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [navigate]);

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
      <Suspense fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#070B14]">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple animate-spin"></div>
          </div>
        </div>
      }>
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
            <Route path="brain" element={<BrainCore />} />
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
      </Suspense>
    </>
  );
}
