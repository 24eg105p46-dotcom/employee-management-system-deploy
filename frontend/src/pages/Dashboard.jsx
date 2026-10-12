import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useInterval } from '../hooks/useInterval';
import { STATUS, STATUS_COLOR, money, relDate } from '../utils';
import Avatar from '../components/Avatar.jsx';
import LivePill from '../components/LivePill.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const load = useCallback(async () => {
    try {
      setStats(await api.get('/api/dashboard/stats'));
      setOnline(true);
      setLastSync(Date.now());
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useInterval(load, 10000); // live refresh

  const s = stats;
  const total = s ? s.totalEmployees || 1 : 1;
  const parts = s
    ? [['ACTIVE', s.activeEmployees], ['ON_LEAVE', s.onLeaveEmployees], ['INACTIVE', s.inactiveEmployees]]
    : [];
  const rows = s ? s.employeesByDepartment || [] : [];
  const max = Math.max(1, ...rows.map((r) => r.count));
  const recent = s ? s.recentHires || [] : [];

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted mb-0">Your workforce at a glance.</p>
        </div>
        <LivePill lastSync={lastSync} online={online} />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-5">
          <div className="panel headcount">
            <div className="panel-label">Total employees</div>
            <div className="headcount-num">{s ? s.totalEmployees : '–'}</div>
            <div className="status-bar" aria-hidden="true">
              {parts.map(([k, n]) => (
                <span key={k} style={{ width: `${(n / total) * 100}%`, background: STATUS_COLOR[k] }} />
              ))}
            </div>
            <ul className="status-legend">
              {parts.map(([k, n]) => (
                <li key={k}>
                  <span className="swatch" style={{ background: STATUS_COLOR[k] }} />
                  {STATUS[k]} <strong>{n}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="row g-3 h-100">
            <div className="col-6">
              <div className="panel mini">
                <i className="bi bi-diagram-3 mini-icon" />
                <div className="mini-num">{s ? s.totalDepartments : '–'}</div>
                <div className="panel-label">Departments</div>
              </div>
            </div>
            <div className="col-6">
              <div className="panel mini">
                <i className="bi bi-currency-rupee mini-icon" />
                <div className="mini-num">{s ? money(s.averageSalary) : '–'}</div>
                <div className="panel-label">Average salary</div>
              </div>
            </div>
            <div className="col-12">
              <div className="panel quick">
                <div>
                  <div className="fw-semibold">Bringing someone on?</div>
                  <div className="text-muted small">Add a new employee record in under a minute.</div>
                </div>
                <button className="btn btn-accent" onClick={() => navigate('/employees', { state: { openNew: true } })}>
                  <i className="bi bi-person-plus me-1" /> Add employee
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="panel">
            <div className="panel-title">Headcount by department</div>
            <div className="dept-bars">
              {rows.length === 0 && <div className="text-muted">{s ? 'No departments yet.' : 'Loading…'}</div>}
              {rows.map((r) => (
                <div className="dept-row" key={r.department}>
                  <div className="name" title={r.department}>{r.department}</div>
                  <div className="track"><div className="fill" style={{ width: `${(r.count / max) * 100}%` }} /></div>
                  <div className="num">{r.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="panel">
            <div className="panel-title">Latest hires</div>
            <ul className="recent">
              {recent.length === 0 && <li className="text-muted">{s ? 'No employees yet.' : 'Loading…'}</li>}
              {recent.map((e) => (
                <li key={e.id} tabIndex={0}
                    onClick={() => navigate('/employees', { state: { viewId: e.id } })}
                    onKeyDown={(ev) => { if (ev.key === 'Enter') navigate('/employees', { state: { viewId: e.id } }); }}>
                  <Avatar emp={e} />
                  <div className="who">
                    <div className="n">{e.firstName} {e.lastName}</div>
                    <div className="t">{e.jobTitle}{e.department ? ` · ${e.department.name}` : ''}</div>
                  </div>
                  <div className="when">{relDate(e.hireDate)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
