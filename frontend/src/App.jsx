import { useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import Departments from './pages/Departments.jsx';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="topbar d-lg-none">
        <button className="btn btn-icon" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <i className="bi bi-list fs-4" />
        </button>
        <span className="brand-name">People Desk</span>
        <span className="live-pill" title="Live data"><span className="live-dot" /></span>
      </header>

      <div className="app">
        {menuOpen && <div className="backdrop" onClick={close} />}

        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="sidebar-inner">
            <div className="brand">
              <span className="brand-mark"><i className="bi bi-people-fill" /></span>
              <span className="brand-name">People Desk</span>
              <button type="button" className="btn-close btn-close-white d-lg-none ms-auto" onClick={close} aria-label="Close menu" />
            </div>

            <nav className="nav flex-column mt-4">
              <NavLink to="/" end className="nav-link" onClick={close}><i className="bi bi-grid-1x2" /> Dashboard</NavLink>
              <NavLink to="/employees" className="nav-link" onClick={close}><i className="bi bi-person-vcard" /> Employees</NavLink>
              <NavLink to="/departments" className="nav-link" onClick={close}><i className="bi bi-diagram-3" /> Departments</NavLink>
            </nav>

            <div className="sidebar-foot">
              <div className="small opacity-75">Employee Management System</div>
              <div className="small opacity-50">React · Spring Boot · MySQL</div>
            </div>
          </div>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
