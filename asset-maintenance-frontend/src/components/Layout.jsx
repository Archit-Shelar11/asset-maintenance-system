import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Wrench, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  Layers,
  Shield
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <Wrench size={26} color="hsl(var(--primary))" />
          <h2 style={styles.logoText}>AM Automation</h2>
        </div>

        {/* User Card inside Sidebar */}
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            <UserIcon size={20} color="#fff" />
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.fullName}</div>
            <div style={styles.userEmail}>{user?.email}</div>
            <div style={{ marginTop: '6px' }}>
              <span className="badge badge-role">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={styles.nav}>
          <NavLink 
            to="/" 
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {})
            })}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/assets" 
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {})
            })}
          >
            <Layers size={18} />
            <span>Assets</span>
          </NavLink>

          {user?.role === 'ADMIN' && (
            <NavLink 
              to="/admin" 
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              })}
            >
              <Shield size={18} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* Bottom Actions */}
        <div style={styles.footer}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    background: '#ffffff',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '0 8px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  userCard: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    marginBottom: '28px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userEmail: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    background: '#eff6ff',
    borderLeft: '3px solid var(--primary)',
    color: 'var(--primary)',
    paddingLeft: '13px', // adjusts for the border width
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: 'var(--danger)',
    fontSize: '15px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    flexGrow: 1,
    overflowY: 'auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  contentWrapper: {
    padding: '40px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  }
};

export default Layout;
