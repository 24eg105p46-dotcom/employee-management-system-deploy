import { avatarColor, initials } from '../utils';

export default function Avatar({ emp, large = false }) {
  return (
    <span className={`avatar ${large ? 'lg' : ''}`} style={{ background: avatarColor(emp) }}>
      {initials(emp)}
    </span>
  );
}
