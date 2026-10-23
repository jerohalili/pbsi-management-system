import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth.ts';
import { Button } from '@/components/ui/button.tsx';
import { GraduationCap, Users, BookOpen, Award } from 'lucide-react';

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
      <div className="min-h-screen w-full bg-gradient-to-r from-primary to-primary-light px-4 py-12">
        <div className="max-w-[1596px] mx-auto text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 text-white mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white leading-[0.95] mb-10 tracking-tighter">
            PBSI School Management
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-xl md:text-2xl leading-relaxed mb-16 font-medium">
            The modern school management system for students, teachers, and administrators.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white text-primary px-10 py-4 rounded-2xl font-bold text-xl hover:bg-blue-700 hover:bg-blue-700 transition-all duration-300 active:scale-95"
            >
              Sign in
            </Button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-site-card/60 backdrop-blur-sm text-site-text border-2 border-site-border rounded-2xl px-10 py-4 font-bold text-xl hover:bg-site-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 active:scale-95"
            >
              Create account
            </button>
          </div>
        </div>

        <div className="max-w-[1596px] mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Student Records"
              desc="Manage student profiles, enrollment history, subjects, and cumulative GPA tracking."
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-primary" />}
              title="Courses & Modules"
              desc="Create courses with rich content, modules, video links, and downloadable attachments."
            />
            <FeatureCard
              icon={<Award className="w-6 h-6 text-primary" />}
              title="Grades & GPA"
              desc="Track assignments, quizzes, term grades, and cumulative GPA analytics."
            />
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

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group bg-site-card border border-site-border rounded-[32px] p-8 shadow-sm hover:border-primary/20 transition-all duration-500 ease-out flex flex-col h-full min-h-full">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-500 ease-out shrink-0">
        {icon}
      </div>
      <h3 className="font-bold text-site-text mb-2">{title}</h3>
      <p className="text-site-muted leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
