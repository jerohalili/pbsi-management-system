/**
 * Works out whether a person is still signed in when the app starts, without ever mistaking
 * "the server is busy or waking up" for "you are signed out".
 *
 *  - 401 from /auth/me: the short-lived access token ran out, so try the longer-lived refresh
 *    cookie once, then ask again.
 *  - A clear 401/403 (even after refreshing): signed out.
 *  - Anything else (no connection, a server that is still waking up, 429, 5xx): temporary.
 *    Wait and try again a few times before giving up.
 */
export type SessionResult<User> =
  | { kind: 'signed-in'; user: User }
  | { kind: 'signed-out' }
  | { kind: 'unreachable' };

export interface SessionDeps<User> {
  getMe: () => Promise<User>;
  refresh: () => Promise<void>;
  statusOf: (error: unknown) => number | undefined;
  sleep: (ms: number) => Promise<void>;
  /** Waits between retries. A free-tier server can take about 30 seconds to wake up. */
  retryDelays?: number[];
}

const DEFAULT_RETRY_DELAYS = [2000, 4000, 8000, 16000];

const isDefiniteNo = (status: number | undefined): boolean => status === 401 || status === 403;

export async function resolveSession<User>(deps: SessionDeps<User>): Promise<SessionResult<User>> {
  const delays = deps.retryDelays ?? DEFAULT_RETRY_DELAYS;
  // True once a refresh has worked. A refresh that failed for a temporary reason is tried again.
  let refreshed = false;

  for (let attempt = 0; ; attempt++) {
    try {
      return { kind: 'signed-in', user: await deps.getMe() };
    } catch (error) {
      let status = deps.statusOf(error);

      if (status === 401 && !refreshed) {
        try {
          await deps.refresh();
          refreshed = true;
          continue;
        } catch (refreshError) {
          status = deps.statusOf(refreshError);
        }
      }

      if (isDefiniteNo(status)) return { kind: 'signed-out' };
      if (attempt >= delays.length) return { kind: 'unreachable' };
      await deps.sleep(delays[attempt]);
    }
  }
}
