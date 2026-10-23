import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/toast.tsx';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role, first_name: firstName, last_name: lastName }),
      });
      if (!res.ok) throw new Error(await res.text() || 'Registration failed');
      toast({ title: 'Account created', description: 'You can now log in.', variant: 'success' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Join PBSI School Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white/90 text-gray-500">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign in
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
