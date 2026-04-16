// =============================================================================
// GlobalTravel Corp — Formatting Utilities
// Replaces AngularJS filters with native Intl APIs
// =============================================================================

/**
 * Format a number as USD currency.
 */
export function formatCurrency(
  amount: number,
  showCents = true,
  showSymbol = true,
): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);

  return showSymbol ? formatted : formatted.replace(/^\$/, '');
}

// Preset options for Intl.DateTimeFormat
const DATE_PRESETS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { month: 'numeric', day: 'numeric', year: '2-digit' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  time: { hour: 'numeric', minute: '2-digit', hour12: true },
  datetime: {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
};

/**
 * Format a date string or Date object using named presets.
 * The `iso` preset returns an ISO-8601 string; all others use Intl.DateTimeFormat.
 */
export function formatDate(
  date: string | Date,
  preset: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' | 'iso' = 'medium',
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  if (preset === 'iso') return d.toISOString();

  return new Intl.DateTimeFormat('en-US', DATE_PRESETS[preset]).format(d);
}

// Thresholds for relative time buckets (in seconds)
const TIME_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 3600, unit: 'minute' },
  { amount: 86400, unit: 'hour' },
  { amount: 604800, unit: 'day' },
  { amount: 2592000, unit: 'week' },
  { amount: 31536000, unit: 'month' },
  { amount: Infinity, unit: 'year' },
];

/**
 * Return a human-readable relative time string (e.g. "3 hours ago", "in 2 days").
 */
export function getTimeAgo(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  let seconds = (d.getTime() - Date.now()) / 1000;

  for (const { amount, unit } of TIME_DIVISIONS) {
    if (Math.abs(seconds) < amount) {
      const divisor =
        unit === 'second' ? 1
        : unit === 'minute' ? 60
        : unit === 'hour' ? 3600
        : unit === 'day' ? 86400
        : unit === 'week' ? 604800
        : unit === 'month' ? 2592000
        : 31536000;
      return rtf.format(Math.round(seconds / divisor), unit);
    }
  }

  return rtf.format(Math.round(seconds / 31536000), 'year');
}

/**
 * Format a duration in minutes as "Xh Ym".
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format a time string (e.g. "14:30" or "14:30:00") into a locale-friendly
 * 12-hour representation (e.g. "2:30 PM").
 */
export function formatTime(time: string): string {
  const parts = time.split(':').map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return time;

  const d = new Date();
  d.setHours(parts[0], parts[1], parts[2] ?? 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}
