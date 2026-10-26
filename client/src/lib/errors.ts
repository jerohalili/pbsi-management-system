import axios from 'axios';

interface ApiErrorBody {
  error?: string;
  details?: { field?: string; message?: string }[];
}

/** Turns an API/network error into a short message that is safe to show to users. */
export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    const details = body?.details?.map((d) => d.message).filter(Boolean);
    if (details && details.length > 0) return details.join(' ');
    if (body?.error) return body.error;
    if (!err.response) return 'Cannot reach the server. Check your connection and try again.';
  }
  return fallback;
}
