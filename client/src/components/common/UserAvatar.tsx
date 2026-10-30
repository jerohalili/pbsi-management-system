import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils.ts';

interface UserAvatarProps {
  src?: string | null;
  /** Used for the initials and the accessible label. */
  name?: string | null;
  /** Shown when there is no name (for example an email address). */
  fallback?: string | null;
  className?: string;
}

function initialsOf(name?: string | null, fallback?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (fallback ?? '?').charAt(0).toUpperCase();
}

/** A round profile picture that falls back to initials when there is none (or it fails to load). */
export function UserAvatar({ src, name, fallback, className }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium',
        className,
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name ? `${name}’s profile picture` : 'Profile picture'}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name, fallback)}</span>
      )}
    </span>
  );
}
