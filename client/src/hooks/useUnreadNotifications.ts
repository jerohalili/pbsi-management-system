import { useQuery } from 'react-query';
import api from '@/lib/api.ts';

/** Query key shared with the Notifications page so it can refresh the badge after a change. */
export const UNREAD_COUNT_KEY = ['notifications', 'unread-count'];

/**
 * The signed-in person's unread notification count, for the sidebar badge.
 * Refreshed every minute and whenever the tab regains focus; failures are silent (a badge that
 * cannot update should never get in the way).
 */
export default function useUnreadNotifications(enabled: boolean): number {
  const { data } = useQuery<number>(
    UNREAD_COUNT_KEY,
    async () => (await api.get<{ unread_count: number }>('/notifications/unread-count')).data.unread_count,
    {
      enabled,
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
      staleTime: 15_000,
      retry: false,
    },
  );
  return data ?? 0;
}
