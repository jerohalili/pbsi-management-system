import useAuth from '@/hooks/useAuth.ts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { GraduationCap, Users, BookOpen, Award, User } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_50%,#60a5fa_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent"></div>
        <div className="relative z-10 flex min-h-screen w-full items-center justify-center">
          <div className="animate-pulse flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-200"></div>
            <p className="text-gray-500">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen w-full px-4">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_50%,#60a5fa_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent"></div>
        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">PBSI School Management</h1>
          <p className="text-lg text-gray-500 max-w-md mb-8">
            The modern school management system for students, teachers, and administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg font-medium"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 text-lg font-medium"
            >
              Create account
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            <FeatureIcon icon={<Users className="w-6 h-6 text-blue-600" />} title="Student Records" desc="Manage student profiles, enrollment, and GPA tracking." />
            <FeatureIcon icon={<BookOpen className="w-6 h-6 text-blue-600" />} title="Courses & Modules" desc="Create courses with rich content and assignments." />
            <FeatureIcon icon={<Award className="w-6 h-6 text-blue-600" />} title="Grades & GPA" desc="Track grades, terms, and cumulative GPA analytics." />
          </div>
        </div>
      </div>
    );
  }

  // Authenticated — show welcome dashboard
  const role = (user?.role as string) ?? 'student';
  const target =
    role === 'admin' ? '/students' : role === 'teacher' ? '/courses' : '/dashboard';

  return (
    <div className="relative min-h-screen w-full px-4">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_50%,#60a5fa_100%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent"></div>
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 text-white mb-6">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Welcome back, {user?.email}</h1>
        <p className="text-blue-100 mb-8">Role: {role}</p>
        <Button
          onClick={() => navigate(target)}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

function FeatureIcon({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/50 border border-white/20">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
