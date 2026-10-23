import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth.ts';
import { Button } from '@/components/ui/button.tsx';
import { GraduationCap } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-site-bg flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-site-border"></div>
          <p className="text-site-muted text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-site-bg px-4 py-10">
        <div className="max-w-[1200px] mx-auto text-center">
          {/* Hero header */}
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-2.5 rounded-2xl border border-primary/10 text-primary mb-8">
            <GraduationCap className="w-5 h-5" />
            <span className="font-bold text-site-text">PBSI School Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-site-text mb-6 leading-tight tracking-tight">
            PBSI School Management
          </h1>
          <p className="text-xl text-site-muted max-w-2xl mx-auto leading-relaxed mb-12">
            The modern school management system for students, teachers, and administrators.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-primary text-white rounded-2xl px-10 py-4 font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all duration-200"
            >
              Sign in
            </Button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-white border-2 border-site-border rounded-2xl px-10 py-4 font-bold text-site-text hover:bg-primary/5 active:scale-95 transition-all duration-200"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const role = (user?.role as string) ?? 'student';
  useEffect(() => {
    if (isAuthenticated && user) {
      const target =
        role === 'admin' ? '/students' : role === 'teacher' ? '/courses' : '/dashboard';
      navigate(target);
    }
  }, [user, isAuthenticated, navigate, role]);

  return null;
}
