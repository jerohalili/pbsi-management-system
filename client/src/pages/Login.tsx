import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth.ts';
import { useToast } from '@/components/ui/toast.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Mail, Lock } from 'lucide-react';

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
      toast({ title: 'Welcome back', description: 'You are signed in.', variant: 'success' });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err?.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-site-bg flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-site-text mb-2">Welcome back</h1>
          <p className="text-site-muted">Sign in to your PBSI account</p>
        </div>

        <div className="bg-site-card rounded-2xl border border-site-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-site-muted" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-site-muted" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-white px-8 py-4 rounded-2xl font-bold text-base disabled:opacity-70 transition-all duration-300 hover:bg-blue-700 active:scale-95"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-site-border flex items-center justify-center gap-2 text-sm text-site-muted">
            <span>Need an account? Contact your school administrator.</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-6 text-center">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="text-site-muted text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest"
        >
          ← Go back to homepage
        </a>
      </div>
    </div>
  );
}

