/**
 * Formats a Kubernetes duration string (e.g. "720h0m0s", "24h") to a human-readable string.
 */
export function formatDuration(duration: string | undefined): string {
  if (!duration) return '-';

  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const secondsMatch = duration.match(/(\d+)s/);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(' ') : duration;
}

/**
 * Formats an array of strings for display. Returns "All" if empty or undefined.
 */
export function formatNamespaceList(namespaces: string[] | undefined): string {
  if (!namespaces || namespaces.length === 0) return 'All';
  return namespaces.join(', ');
}

/**
 * Formats an array of strings for display. Returns "All" if empty or undefined.
 */
export function formatResourceList(resources: string[] | undefined): string {
  if (!resources || resources.length === 0) return 'All';
  return resources.join(', ');
}

/**
 * Returns a human-readable cron expression description.
 */
export function describeCron(cron: string): string {
  // Simple common patterns
  const patterns: Record<string, string> = {
    '0 * * * *': 'Every hour',
    '0 0 * * *': 'Every day at midnight',
    '0 0 * * 0': 'Every week on Sunday',
    '0 0 1 * *': 'Every month on the 1st',
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
  };
  return patterns[cron] || cron;
}

/**
 * Calculates duration between two ISO timestamps in a human-readable format.
 */
export function calcDuration(start?: string, end?: string): string {
  if (!start || !end) return '-';
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const diffMs = endMs - startMs;
  if (isNaN(diffMs) || diffMs < 0) return '-';

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
