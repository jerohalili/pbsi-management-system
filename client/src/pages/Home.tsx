import useAuth from '@/hooks/useAuth.ts';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  const role = (user?.role as string) ?? 'student';
  navigate(
    `/${role === 'admin' ? 'students' : role === 'teacher' ? 'courses' : 'dashboard'}`,
    { replace: true },
  );
  return null;
}

