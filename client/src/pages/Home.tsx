import useAuth from '@/hooks/useAuth.ts';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-3xl font-bold mb-4">PBSI School Management</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to continue.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 border border-input rounded-md hover:bg-accent"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  // Authenticated — go to role dashboard
  const role = (user?.role as string) ?? 'student';
  const target =
    role === 'admin' ? '/students' : role === 'teacher' ? '/courses' : '/dashboard';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold mb-4">Welcome back, {user?.email}</h1>
      <p className="text-muted-foreground mb-4">Role: {role}</p>
      <button
        onClick={() => navigate(target)}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
