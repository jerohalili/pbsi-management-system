import useAuth from '@/hooks/useAuth.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Award,
  Bell,
  Clock,
} from 'lucide-react';

const statCards: Array<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = [
  { title: 'Active Students', value: '1,204', icon: <Users size={24} />, color: 'text-primary' },
  { title: 'Courses', value: '42', icon: <LayoutDashboard size={24} />, color: 'text-primary' },
  { title: 'Today\'s Attendance', value: '94%', icon: <Calendar size={24} />, color: 'text-success' },
  { title: 'Pending Grades', value: '12', icon: <Award size={24} />, color: 'text-warning' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'user'} ({user?.role})
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Quick Actions
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className="p-2 rounded-md bg-accent text-accent-foreground">{card.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>New quiz published in Mathematics 101</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>Grade posted for Algebra Assignment</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>2 new students enrolled this week</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>Calculus Problem Set</div>
              <span className="text-xs font-medium bg-muted px-2 py-1 rounded">Due Oct 28</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>History Midterm Quiz</div>
              <span className="text-xs font-medium bg-muted px-2 py-1 rounded">Due Oct 30</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>Chemistry Lab Report</div>
              <span className="text-xs font-medium bg-muted px-2 py-1 rounded">Due Nov 1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

