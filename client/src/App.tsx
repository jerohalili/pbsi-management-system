import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import Courses from '@/pages/Courses.tsx';
import CourseDetail from '@/pages/CourseDetail.tsx';
import Assignments from '@/pages/Assignments.tsx';
import Quizzes from '@/pages/Quizzes.tsx';
import Attendance from '@/pages/Attendance.tsx';
import Timetable from '@/pages/Timetable.tsx';
import Grades from '@/pages/Grades.tsx';
import Discussions from '@/pages/Discussions.tsx';
import Notifications from '@/pages/Notifications.tsx';
import AuditLogs from '@/pages/AuditLogs.tsx';

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
  const Layout = user ? LayoutByRole[user.role as Role] : StudentLayout;
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

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => {
  const { isLoading } = useAuth();
  if (isLoading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route element={<RoleLayout />}>
          <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route
            path="dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="students"
            element={<ProtectedRoute><Students /></ProtectedRoute>}
          />
          <Route
            path="students/:id"
            element={<ProtectedRoute><StudentDetail /></ProtectedRoute>}
          />
          <Route
            path="courses"
            element={<ProtectedRoute><Courses /></ProtectedRoute>}
          />
          <Route
            path="courses/:id"
            element={<ProtectedRoute><CourseDetail /></ProtectedRoute>}
          />
          <Route
            path="assignments"
            element={<ProtectedRoute><Assignments /></ProtectedRoute>}
          />
          <Route
            path="quizzes"
            element={<ProtectedRoute><Quizzes /></ProtectedRoute>}
          />
          <Route
            path="attendance"
            element={<ProtectedRoute><Attendance /></ProtectedRoute>}
          />
          <Route
            path="timetable"
            element={<ProtectedRoute><Timetable /></ProtectedRoute>}
          />
          <Route
            path="grades"
            element={<ProtectedRoute><Grades /></ProtectedRoute>}
          />
          <Route
            path="discussions"
            element={<ProtectedRoute><Discussions /></ProtectedRoute>}
          />
          <Route
            path="notifications"
            element={<ProtectedRoute><Notifications /></ProtectedRoute>}
          />
          <Route
            path="audit-logs"
            element={<AdminOnly><AuditLogs /></AdminOnly>}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
