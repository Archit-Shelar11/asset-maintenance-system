import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      if (!fullName || !email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const res = await register(fullName, email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error);
      }
    } else {
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div className="glass-card animate-fade-in" style={styles.card}>
        {/* Header Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logoGlow}>
            <Wrench size={32} color="hsl(var(--primary))" />
          </div>
          <h1 style={styles.title}>Asset Maintenance</h1>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Automation System Portal</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={styles.inputWrapper}>
                <UserIcon style={styles.inputIcon} size={16} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail style={styles.inputIcon} size={16} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="operator@factory.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <Lock style={styles.inputIcon} size={16} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={styles.toggleText}>
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={styles.toggleBtn}
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    padding: '24px',
    background: 'var(--bg-main)',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoGlow: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-dim)',
    pointerEvents: 'none',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(220, 38, 38, 0.08)',
    border: '1px solid rgba(220, 38, 38, 0.15)',
    color: 'var(--danger)',
    fontSize: '14px',
    marginBottom: '24px',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    outline: 'none',
    padding: 0,
    marginLeft: '4px',
    transition: 'color 0.2s ease',
  },
};

export default Login;
