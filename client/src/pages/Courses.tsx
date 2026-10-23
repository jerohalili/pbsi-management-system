import { useGet } from '@/hooks/useApi.ts';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Plus, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  teacher_first_name: string;
  teacher_last_name: string;
}

export default function CoursesPage() {
  const { data, isLoading } = useGet<{ courses: Course[] }>(
    ['courses'],
    '/api/courses',
  );

  const courses = data?.courses ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Browse available courses and modules.</p>
        </div>
        <Button asChild>
          <Link to="/courses/new">
            <Plus className="w-4 h-4 mr-2" /> New Course
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">{c.code} — {c.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {c.description ?? 'No description available.'}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Credits: {c.credits}</span>
                  <span>Instructor: {c.teacher_first_name} {c.teacher_last_name}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="sm" className="w-full">
                  <Link to={`/courses/${c.id}`}>View Course <GraduationCap className="w-3 h-3 ml-1" /></Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              No courses available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

