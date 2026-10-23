import useAuth from '@/hooks/useAuth.ts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { GraduationCap, Users, BookOpen, Award, User } from 'lucide-react';

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
      <div className="min-h-screen w-full bg-site-bg px-4 py-12">
        {/* Header */}
        <div className="max-w-5xl mx-auto text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-site-text mb-4">PBSI School Management</h1>
          <p className="text-xl text-site-muted max-w-2xl mx-auto">
            The modern school management system for students, teachers, and administrators.
          </p>
        </div>

        {/* Feature grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* CTA */}
        <div className="max-w-xl mx-auto mt-16 flex flex-col items-center gap-4">
          <Button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto bg-primary text-white hover:bg-blue-700 px-8 py-3 text-lg"
          >
            Sign in
          </Button>
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto border border-site-border bg-site-card text-site-text hover:bg-site-bg px-8 py-3 text-lg"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  // Authenticated — show welcome dashboard
  const role = (user?.role as string) ?? 'student';
  const target =
    role === 'admin' ? '/students' : role === 'teacher' ? '/courses' : '/dashboard';

  return (
    <div className="min-h-screen w-full bg-site-bg px-4 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-site-text mb-2">Welcome back, {user?.email}</h1>
        <p className="text-site-muted mb-10">Role: {role}</p>
        <Button
          onClick={() => navigate(target)}
          className="bg-primary text-white hover:bg-blue-700 px-8 py-3"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl bg-site-card border border-site-border">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-bold text-site-text mb-2">{title}</h3>
      <p className="text-site-muted text-sm">{desc}</p>
    </div>
  );
}
