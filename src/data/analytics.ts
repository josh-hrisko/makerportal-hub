export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  [key: string]: any;
}

/**
 * Privacy-safe, per-browser interaction log.
 * Logs events to console and appends to a 100-event rolling log in localStorage.
 * Nothing is transmitted, so this must never be presented as site-wide traffic,
 * conversions, unique users, or aggregate social proof.
 * No third-party pixels, trackers, or telemetry endpoints.
 */
export function logEvent(detail: any): void {
  console.log('[Analytics]', detail);

  try {
    const stored = localStorage.getItem('mp_analytics_log');
    const logs: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

    logs.push({
      timestamp: new Date().toISOString(),
      ...detail,
    });

    // Enforce rolling log cap to prevent localStorage bloat
    if (logs.length > 100) {
      logs.shift();
    }

    localStorage.setItem('mp_analytics_log', JSON.stringify(logs));
  } catch (err) {
    console.warn('[Analytics] Failed to write event to localStorage', err);
  }
}
