import { useEffect, useState } from 'react';

// Shows "Live · updated 4s ago" and turns red when the API is unreachable.
export default function LivePill({ lastSync, online }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  let text = 'Connecting…';
  if (!online) text = 'Offline – retrying';
  else if (lastSync) {
    const s = Math.max(0, Math.round((Date.now() - lastSync) / 1000));
    text = s < 3 ? 'Live · just now' : `Live · updated ${s}s ago`;
  }
  return (
    <div className={`live-pill ${online ? '' : 'offline'}`}>
      <span className="live-dot" />
      <span>{text}</span>
    </div>
  );
}
