import { STATUS } from '../utils';

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{STATUS[status] || status}</span>;
}
