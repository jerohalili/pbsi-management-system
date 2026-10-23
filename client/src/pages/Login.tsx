import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth.ts';
import { useToast } from '@/components/ui/toast.tsx';
import api from '@/lib/api.ts';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
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
  const [role, setRole] = useState('student');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const name = email.split('@')[0] || 'User';
        await api.post('/auth/register', {
          email,
          password,
          role,
          first_name: name,
          last_name: 'Account',
        });
        toast({ title: 'Account created', description: 'You can now log in.', variant: 'success' });
        setIsRegister(false);
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err: any) {
      toast({ title: 'Login failed', description: err?.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle>{isRegister ? 'Create Account' : 'Welcome back'}</CardTitle>
          <CardDescription>
            {isRegister ? 'Join PBSI School Management System' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center pl-3 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input id="email" type="email" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-3" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center pl-3 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-3" />
                </div>
              </div>
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                    </select>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister((p) => !p)}
              className="text-primary font-medium hover:underline"
            >
              {isRegister ? 'Sign in' : 'Create account'}
            </button>
          </p>
          <Link to="/" className="text-xs text-muted-foreground underline underline-offset-4">
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

