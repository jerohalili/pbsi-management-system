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
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  const Layout = user ? LayoutByRole[user.role] : StudentLayout;
  return <Layout>{children}</Layout>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) return null;
  if (!user || !isAuthenticated) {
    navigate('/login', { state: { from: location }, replace: true });
    return null;
  }
  return <>{children}</>;
}

const App = () => {
  const { isLoading } = useAuth();
  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route element={<RoleLayout />}>
        <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="students/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
