/**
 * Minimal beta error reporting — no external dependency. Uncaught errors and
 * unhandled promise rejections POST a compact, throttled report to the same
 * endpoint as tester feedback (VITE_FEEDBACK_ENDPOINT).
 *
 * Privacy: reports contain the error message/stack head, page hash, app version,
 * user agent and timestamp only — never localStorage contents, targets, meal
 * selections or condition mode. Upgrade path: swap this file for Sentry
 * (see docs/DEPLOYMENT.md) when the beta outgrows it.
 */
const ENDPOINT = (import.meta.env.VITE_FEEDBACK_ENDPOINT ?? '').trim();
const MAX_REPORTS_PER_SESSION = 5;
let sent = 0;
const seen = new Set<string>();

function report(kind: string, message: string, stack?: string) {
  if (!ENDPOINT || sent >= MAX_REPORTS_PER_SESSION) return;
  const key = `${kind}:${message}`;
  if (seen.has(key)) return; // don't spam duplicates
  seen.add(key);
  sent += 1;
  const payload = {
    type: 'auto-error',
    kind,
    message: String(message).slice(0, 300),
    stack: stack ? String(stack).slice(0, 600) : undefined,
    page: window.location.hash || '#planner',
    appVersion: __APP_VERSION__,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };
  try {
    // sendBeacon survives page unloads; fall back to fetch.
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (!navigator.sendBeacon?.(ENDPOINT, blob)) {
      void fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    // never let error reporting itself throw
  }
}

/** Install global listeners. Call once from main.tsx (production only). */
export function initErrorReporting(): void {
  if (!ENDPOINT) return;
  window.addEventListener('error', (e) => {
    report('error', e.message ?? 'Unknown error', e.error?.stack);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason as { message?: string; stack?: string } | undefined;
    report('unhandledrejection', reason?.message ?? String(e.reason ?? 'Unknown rejection'), reason?.stack);
  });
}
