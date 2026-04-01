import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const initials = (user.username || 'U').slice(0, 2).toUpperCase();
  const onDash = location.pathname === '/dashboard';

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoDot} />
        <span className={styles.logoText}>CredLearn</span>
        {isDemo && <span className={styles.demoChip}>demo</span>}
      </div>

      <div className={styles.center}>
        <button
          className={`${styles.navLink} ${onDash ? styles.active : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`${styles.navLink} ${!onDash ? styles.active : ''}`}
          onClick={() => navigate('/transactions')}
        >
          Transactions
        </button>
      </div>

      <div className={styles.right}>
        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <span className={styles.username}>{user.username}</span>
        </div>
        <Button variant="ghost" onClick={logout} style={{ fontSize: '13px', padding: '6px 13px' }}>
          Sign out
        </Button>
      </div>
    </nav>
  );
}
