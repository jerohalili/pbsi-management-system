import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth.ts';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  ClipboardList,
  BarChart3,
  MessageCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldAlert,
  BookOpen,
  Award,
} from 'lucide-react';

const navItems: Array<{
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ('admin' | 'teacher' | 'student' | 'parent')[];
}> = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Students', href: '/students', icon: <Users size={18} />, roles: ['admin', 'teacher'] },
  { label: 'Courses', href: '/courses', icon: <BookOpen size={18} />, roles: ['admin', 'teacher', 'student'] },
  { label: 'Assignments', href: '/assignments', icon: <FileText size={18} />, roles: ['admin', 'teacher', 'student'] },
  { label: 'Quizzes', href: '/quizzes', icon: <ClipboardList size={18} />, roles: ['admin', 'teacher', 'student'] },
  { label: 'Attendance', href: '/attendance', icon: <Calendar size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Timetable', href: '/timetable', icon: <BarChart3 size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Grades', href: '/grades', icon: <Award size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Discussions', href: '/discussions', icon: <MessageCircle size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Notifications', href: '/notifications', icon: <Bell size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Audit Logs', href: '/audit-logs', icon: <ShieldAlert size={18} />, roles: ['admin'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items = navItems.filter((i) => i.roles.includes(user?.role as any));

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full border-r border-input bg-background z-20 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-input px-4">
        {!collapsed && (
          <>
            <span className="font-bold text-lg tracking-tight">PBSI</span>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="ml-auto p-1 hover:bg-accent rounded-md"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 hover:bg-accent rounded-md"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              } ${collapsed ? 'justify-center px-1' : ''}`}
              aria-pressed={isActive}
            >
              <span className={collapsed ? 'w-6' : 'w-5 h-5'}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-input">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
            <img src={user?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user?.email}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

export function TopNav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-input bg-background/95 backdrop-blur px-4">
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-sm text-muted-foreground">
          {(user?.role ?? '').charAt(0).toUpperCase() + (user?.role ?? '').slice(1)} Portal
        </span>
      </div>
      <div className="flex items-center gap-2">
        <AvatarBadge />
      </div>
    </header>
  );
}

function AvatarBadge() {
  const { user } = useAuth();
  return (
    <div className="relative inline-block">
      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium overflow-hidden">
        {user?.email?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`md:pl-64 ${/* collapsed */ 'pl-16'} transition-all duration-300`}>
        <TopNav />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`md:pl-64 ${/* collapsed */ 'pl-16'} transition-all duration-300`}>
        <TopNav />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

export function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
