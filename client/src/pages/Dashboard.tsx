import useAuth from '@/hooks/useAuth.ts';
import { Card } from '@/components/ui/card.tsx';
import { Users, BookOpen, Award, Calendar, Clock, Bell, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role as string) ?? 'student';

  const statCards = [
    { title: 'Active Students', value: '1,204', icon: <Users className="w-5 h-5" /> },
    { title: 'Courses', value: '42', icon: <BookOpen className="w-5 h-5" /> },
    { title: "Today's Attendance", value: '94%', icon: <Calendar className="w-5 h-5" /> },
    { title: 'Pending Grades', value: '12', icon: <Award className="w-5 h-5" /> },
  ];

  const quickLinks = role === 'admin'
    ? [
        { label: 'Manage Students', href: '/students', icon: <Users className="w-4 h-4" /> },
        { label: 'View Courses', href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Audit Logs', href: '/audit-logs', icon: <ShieldAlert className="w-4 h-4" /> },
      ]
    : role === 'teacher'
    ? [
        { label: 'View Courses', href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Mark Attendance', href: '/attendance', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Post Grades', href: '/grades', icon: <Award className="w-4 h-4" /> },
      ]
    : [
        { label: 'My Courses', href: '/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'My Grades', href: '/grades', icon: <Award className="w-4 h-4" /> },
        { label: 'Attendance', href: '/attendance', icon: <Calendar className="w-4 h-4" /> },
      ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-site-text">Dashboard</h1>
          <p className="text-site-muted">
            Welcome back, {user?.email?.split('@')[0]} ({role})
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-site-muted">{card.title}</p>
                <p className="text-2xl font-bold text-site-text">{card.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link, i) => (
          <Card
            key={i}
            onClick={() => navigate(link.href)}
            className="p-6 cursor-pointer hover:bg-primary/5 transition-colors border border-site-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {link.icon}
              </div>
              <div>
                <h3 className="font-bold text-site-text">{link.label}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-site-text">Recent Activity</h2>
          <button className="text-sm text-primary hover:underline">View all</button>
        </div>
        <div className="space-y-4">
          <ActivityRow icon={<Clock className="w-4 h-4 text-site-muted" />} text="New quiz published in Mathematics 101" time="2 hours ago" />
          <ActivityRow icon={<Bell className="w-4 h-4 text-site-muted" />} text="Grade posted for Algebra Assignment" time="4 hours ago" />
          <ActivityRow icon={<Users className="w-4 h-4 text-site-muted" />} text="2 new students enrolled this week" time="1 day ago" />
        </div>
      </Card>
    </div>
  );
}


function ActivityRow({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-site-text">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{text}</p>
        <p className="text-xs text-site-muted">{time}</p>
      </div>
    </div>
  );
}
