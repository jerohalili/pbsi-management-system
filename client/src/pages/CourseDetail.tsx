import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { ArrowLeft, ClipboardList, ExternalLink, FileText, HelpCircle, Pencil, Plus, Trash2, Video } from 'lucide-react';
import useAuth from '@/hooks/useAuth.ts';
import { useGet } from '@/hooks/useApi.ts';
import api from '@/lib/api.ts';
import { useToast } from '@/components/ui/toast.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { CourseFormDialog, CourseFormValues } from '@/components/courses/CourseFormDialog.tsx';
import { ModuleFormDialog, ModuleFormValues } from '@/components/courses/ModuleFormDialog.tsx';
import { ConfirmDialog } from '@/components/users/ConfirmDialog.tsx';
import { AssignmentFormDialog } from '@/components/assignments/AssignmentFormDialog.tsx';
import { AssignmentStatusBadge } from '@/components/assignments/AssignmentStatusBadge.tsx';
import type { AssignmentItem } from '@/components/assignments/types.ts';
import { QuizFormDialog } from '@/components/quizzes/QuizFormDialog.tsx';
import { formatTimeLimit, type QuizItem } from '@/components/quizzes/types.ts';
import { formatDateTime } from '@/lib/utils.ts';

interface Course extends CourseFormValues {
  teacher_first_name: string | null;
  teacher_last_name: string | null;
  is_mine: boolean;
}

interface Module extends ModuleFormValues {
  course_id: string;
}

// Module links come from users, so only ever render real web links.
const isWebUrl = (value: string | null | undefined): value is string =>
  !!value && /^https?:\/\//i.test(value);

type ModuleDialog = { mode: 'create' } | { mode: 'edit'; module: Module } | null;

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingCourse, setEditingCourse] = useState(false);
  const [assignmentModuleId, setAssignmentModuleId] = useState<string | null>(null);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [moduleDialog, setModuleDialog] = useState<ModuleDialog>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: 'course' } | { kind: 'module'; module: Module } | null
  >(null);

  const { data, isLoading, isError, refetch } = useGet<{ course: Course; modules: Module[] }>(
    ['course', id ?? ''],
    `/courses/${id}`,
    { enabled: !!id },
  );

  const { data: assignmentData } = useGet<{ assignments: AssignmentItem[] }>(
    ['assignments', 'course', id ?? ''],
    `/assignments?course_id=${id}`,
    { enabled: !!id },
  );
  const assignmentsByModule = (assignmentData?.assignments ?? []).reduce<Record<string, AssignmentItem[]>>(
    (acc, a) => {
      (acc[a.module_id] ||= []).push(a);
      return acc;
    },
    {},
  );

  const { data: quizData } = useGet<{ quizzes: QuizItem[] }>(
    ['quizzes', 'course', id ?? ''],
    `/quizzes?course_id=${id}`,
    { enabled: !!id },
  );
  const quizzes = quizData?.quizzes ?? [];

  const isAdmin = user?.role === 'admin';
  const course = data?.course;
  const modules = data?.modules ?? [];
  const canEdit = !!course && (isAdmin || (user?.role === 'teacher' && course.is_mine));

  const refresh = () => {
    queryClient.invalidateQueries('course');
    queryClient.invalidateQueries('courses');
    queryClient.invalidateQueries('assignments');
    queryClient.invalidateQueries('quizzes');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'course') {
      await api.delete(`/courses/${id}`);
      toast({ title: 'Course deleted', variant: 'success' });
      queryClient.invalidateQueries('courses');
      navigate('/courses');
    } else {
      await api.delete(`/modules/${deleteTarget.module.id}`);
      toast({ title: 'Module deleted', variant: 'success' });
      refresh();
    }
  };

  const back = (
    <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="w-4 h-4 mr-1" /> Courses
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {back}
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="space-y-6">
        {back}
        <Card className="p-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Couldn’t load this course. It may no longer exist.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const teacherName = `${course.teacher_first_name ?? ''} ${course.teacher_last_name ?? ''}`.trim() || '—';

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {back}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{course.code}</Badge>
              {course.is_mine && <Badge variant="success">Your course</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-sm text-muted-foreground">
              Teacher: {teacherName} · {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
            </p>
            {course.description && <p className="text-sm max-w-2xl whitespace-pre-wrap">{course.description}</p>}
          </div>
          {(canEdit || isAdmin) && (
            <div className="flex gap-2 shrink-0">
              {canEdit && (
                <Button variant="outline" onClick={() => setEditingCourse(true)}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit course
                </Button>
              )}
              {isAdmin && (
                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ kind: 'course' })}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Modules</h2>
          {canEdit && (
            <Button onClick={() => setModuleDialog({ mode: 'create' })}>
              <Plus className="w-4 h-4 mr-2" /> Add module
            </Button>
          )}
        </div>

        {modules.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No modules yet.</p>
            {canEdit && <p className="text-sm mt-1">Add the first module to start building this course.</p>}
          </Card>
        ) : (
          <div className="space-y-3">
            {modules.map((m, index) => (
              <Card key={m.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <h3 className="font-bold">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {m.title}
                    </h3>
                    {m.rich_description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{m.rich_description}</p>
                    )}
                    {(isWebUrl(m.video_url) || isWebUrl(m.attachment_url)) && (
                      <div className="flex flex-wrap gap-4 pt-1">
                        {isWebUrl(m.video_url) && (
                          <a href={m.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary hover:underline">
                            <Video className="w-4 h-4 mr-1" /> Watch video <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                        {isWebUrl(m.attachment_url) && (
                          <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-primary hover:underline">
                            <FileText className="w-4 h-4 mr-1" /> Open material <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    )}
                    {((assignmentsByModule[m.id] ?? []).length > 0 || canEdit) && (
                      <div className="pt-2 space-y-2">
                        {(assignmentsByModule[m.id] ?? []).length > 0 && (
                          <ul className="space-y-1">
                            {(assignmentsByModule[m.id] ?? []).map((a) => (
                              <li key={a.id} className="flex items-center gap-2 flex-wrap text-sm">
                                <ClipboardList className="w-4 h-4 text-muted-foreground shrink-0" />
                                <Link to={`/assignments/${a.id}`} className="font-medium hover:underline">
                                  {a.title}
                                </Link>
                                <span className="text-muted-foreground">due {formatDateTime(a.due_date)}</span>
                                <AssignmentStatusBadge status={a.status} isLate={a.is_late} />
                              </li>
                            ))}
                          </ul>
                        )}
                        {canEdit && (
                          <Button variant="outline" size="sm" onClick={() => setAssignmentModuleId(m.id)}>
                            <Plus className="w-4 h-4 mr-1" /> Add assignment
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {(canEdit || isAdmin) && (
                    <div className="flex shrink-0">
                      {canEdit && (
                        <Button variant="ghost" size="icon" aria-label={`Edit module ${m.title}`} title="Edit" onClick={() => setModuleDialog({ mode: 'edit', module: m })}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="ghost" size="icon" aria-label={`Delete module ${m.title}`} title="Delete" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ kind: 'module', module: m })}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Quizzes</h2>
          {canEdit && (
            <Button onClick={() => setCreatingQuiz(true)}>
              <Plus className="w-4 h-4 mr-2" /> New quiz
            </Button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No quizzes yet.</p>
            {canEdit && <p className="text-sm mt-1">Create a quiz, add questions, then publish it for students.</p>}
          </Card>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => (
              <Card key={q.id} className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Link to={`/quizzes/${q.id}`} className="font-medium hover:underline">
                        {q.title}
                      </Link>
                      {q.can_manage && (
                        <Badge variant={q.is_published ? 'success' : 'warning'}>{q.is_published ? 'Published' : 'Draft'}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {q.question_count} {q.question_count === 1 ? 'question' : 'questions'} · {q.total_points} points ·{' '}
                      {formatTimeLimit(q.time_limit_minutes)}
                    </p>
                  </div>
                  {q.status === 'completed' && q.attempt_id ? (
                    <Link to={`/quiz-results/${q.attempt_id}`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <Badge variant="success">Completed</Badge> {q.my_score}%
                    </Link>
                  ) : q.status === 'not_taken' ? (
                    <Button asChild size="sm">
                      <Link to={`/quizzes/${q.id}`}>Take quiz</Link>
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <CourseFormDialog
        open={editingCourse}
        onOpenChange={setEditingCourse}
        mode="edit"
        isAdmin={isAdmin}
        course={course}
        onSaved={() => {
          refresh();
          toast({ title: 'Course updated', variant: 'success' });
        }}
      />

      <QuizFormDialog
        open={creatingQuiz}
        onOpenChange={setCreatingQuiz}
        mode="create"
        courseId={course.id}
        onSaved={(quiz) => {
          refresh();
          toast({ title: 'Quiz created', variant: 'success' });
          navigate(`/quizzes/${quiz.id}`);
        }}
      />

      <AssignmentFormDialog
        open={assignmentModuleId !== null}
        onOpenChange={(open) => !open && setAssignmentModuleId(null)}
        mode="create"
        moduleId={assignmentModuleId ?? undefined}
        onSaved={() => {
          refresh();
          toast({ title: 'Assignment created', variant: 'success' });
        }}
      />

      <ModuleFormDialog
        open={moduleDialog !== null}
        onOpenChange={(open) => !open && setModuleDialog(null)}
        mode={moduleDialog?.mode ?? 'create'}
        courseId={course.id}
        nextOrderIndex={modules.length > 0 ? Math.max(...modules.map((m) => m.order_index)) + 1 : 0}
        module={moduleDialog?.mode === 'edit' ? moduleDialog.module : null}
        onSaved={() => {
          refresh();
          toast({ title: moduleDialog?.mode === 'edit' ? 'Module updated' : 'Module added', variant: 'success' });
        }}
      />

      {deleteTarget && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={deleteTarget.kind === 'course' ? 'Delete this course?' : 'Delete this module?'}
          description={
            deleteTarget.kind === 'course'
              ? `“${course.name}” will be removed permanently. A course that still has modules, quizzes or grades can’t be deleted.`
              : `“${deleteTarget.module.title}” will be removed permanently. A module that still has assignments can’t be deleted.`
          }
          confirmLabel="Delete"
          destructive
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
