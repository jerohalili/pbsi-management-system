import React from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import useAuth from '@/hooks/useAuth.ts';
import {
  AdminLayout,
  TeacherLayout,
  StudentLayout,
  ParentLayout,
} from '@/components/layout/Sidebar.tsx';
import Dashboard from '@/pages/Dashboard.tsx';
import Login from '@/pages/Login.tsx';
import Register from '@/pages/Register.tsx';
import Home from '@/pages/Home.tsx';
import NotFound from '@/pages/NotFound.tsx';
import Students from '@/pages/Students.tsx';
import StudentDetail from '@/pages/StudentDetail.tsx';

type Role = 'admin' | 'teacher' | 'student' | 'parent';

const LayoutByRole: Record<Role, React.ComponentType<{ children: React.ReactNode }>> = {
  admin: AdminLayout,
  teacher: TeacherLayout,
  student: StudentLayout,
  parent: ParentLayout,
};

function RoleLayout({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const Layout = user ? LayoutByRole[user.role as Role] : StudentLayout;
  return <Layout>{children}</Layout>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user || !isAuthenticated) {
    navigate('/login', { state: { from: location }, replace: true });
    return <div className="min-h-screen flex items-center justify-center">Redirecting…</div>;
  }
  return <>{children}</>;
}

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route element={<RoleLayout />}>
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="students/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
