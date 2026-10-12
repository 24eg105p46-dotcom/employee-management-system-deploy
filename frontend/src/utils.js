export const STATUS = { ACTIVE: 'Active', ON_LEAVE: 'On leave', INACTIVE: 'Inactive' };
export const STATUS_COLOR = { ACTIVE: 'var(--moss)', ON_LEAVE: 'var(--saffron)', INACTIVE: 'var(--brick)' };
const AVATAR_COLORS = ['#0d7c7a', '#3b6fb0', '#8a5fb5', '#c0643a', '#4f8a3f', '#b0486b', '#5b6b8c', '#a07a1c'];

export const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

// 'YYYY-MM-DD' -> local Date (avoids timezone shifts)
export function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function fmtDate(s) {
  const d = parseDate(s);
  return d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

export function tenure(s) {
  const d = parseDate(s);
  if (!d) return '—';
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months--;
  if (months < 1) return 'Less than a month';
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo` : ''].filter(Boolean).join(' ');
}

export function relDate(s) {
  const d = parseDate(s);
  if (!d) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today - d) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 31) return `${days} days ago`;
  return fmtDate(s);
}

export const initials = (e) => ((e.firstName || '?')[0] + ((e.lastName || '')[0] || '')).toUpperCase();
export const avatarColor = (e) => AVATAR_COLORS[((e.id || 0) + (e.firstName || '').length) % AVATAR_COLORS.length];
