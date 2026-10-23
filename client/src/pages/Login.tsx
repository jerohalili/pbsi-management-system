import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth.ts';
import { useToast } from '@/components/ui/toast.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Mail, Lock, User } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err?.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full px-4">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_50%,#60a5fa_100%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent"></div>
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 px-8 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 mb-4">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1">Sign in to your PBSI account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white/90 text-gray-500">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Create account
                </button>
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <span className="w-3 h-3 text-gray-400">←</span> Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
