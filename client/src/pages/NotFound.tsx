import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="mt-2 text-xl text-muted-foreground">Page not found</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}


