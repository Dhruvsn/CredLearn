import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Toast } from '../components/UI';
import { useToast } from '../hooks/useToast';
import styles from './AuthPage.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const { login, demo } = useAuth();
  const navigate = useNavigate();
  const { toast, show } = useToast();

  const goApp = () => navigate('/dashboard');

  return (
    <div className={styles.page}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden />

      <div className={styles.layout}>
        {/* Hero side */}
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={`${styles.logotype} fade-up`}>
              <span className={styles.dot} />
              CredLearn
            </div>
            <h1 className={`${styles.headline} fade-up fade-up-1`}>
              Learn. Teach.<br /><em>Earn on-chain.</em>
            </h1>
            <p className={`${styles.sub} fade-up fade-up-2`}>
              A trustless peer learning marketplace powered by SkillCredit (SCX) tokens and Ethereum smart contracts.
            </p>
            <ul className={`${styles.features} fade-up fade-up-3`}>
              {[
                ['◈', 'SCX ERC20 token as native currency'],
                ['◉', 'Escrow-secured session payments'],
                ['◇', 'Treasury-managed rewards & fees'],
                ['◆', 'Full on-chain transaction history'],
              ].map(([icon, text]) => (
                <li key={text} className={styles.feature}>
                  <span className={styles.ficon}>{icon}</span>
                  {text}
                </li>
              ))}
            </ul>

            <div className={`${styles.contractPills} fade-up fade-up-4`}>
              {['SkillCredit', 'Escrow', 'Treasury'].map(c => (
                <div key={c} className={styles.pill}>
                  <span className={styles.pillDot} />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className={`${styles.formWrap} fade-up fade-up-2`}>
          <div className={styles.formCard}>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => setTab('login')}>
                Sign in
              </button>
              <button className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => setTab('register')}>
                Register
              </button>
            </div>

            {tab === 'login'
              ? <LoginForm onSuccess={(d) => { login(d); goApp(); }} onError={show} />
              : <RegisterForm onSuccess={() => { show('Account created — sign in!', 'success'); setTab('login'); }} onError={show} />
            }

            <div className={styles.demoRow}>
              <span>No backend?</span>
              <button className={styles.demoBtn} onClick={() => { demo(); goApp(); }}>
                Try demo mode →
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

/* ── Login Form ───────────────────────────────────── */
function LoginForm({ onSuccess, onError }) {
  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!fields.email)    e.email    = 'Required';
    if (!fields.password) e.password = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onSuccess(data);
    } catch (err) {
      const msg = err.message.toLowerCase().includes('fetch')
        ? 'Cannot reach server. Use demo mode.'
        : err.message;
      onError(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <Input label="Email" id="email" type="email" placeholder="you@example.com"
        value={fields.email} onChange={set('email')} error={errors.email} autoComplete="email" />
      <Input label="Password" id="password" type="password" placeholder="••••••••"
        value={fields.password} onChange={set('password')} error={errors.password} autoComplete="current-password" />
      <Button type="submit" fullWidth loading={loading}>Sign in</Button>
    </form>
  );
}

/* ── Register Form ────────────────────────────────── */
function RegisterForm({ onSuccess, onError }) {
  const [fields, setFields] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!fields.username) e.username = 'Required';
    if (!fields.email)    e.email    = 'Required';
    if (!fields.password) e.password = 'Required';
    else if (fields.password.length < 8) e.password = 'At least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      onSuccess(data);
    } catch (err) {
      const msg = err.message.toLowerCase().includes('fetch')
        ? 'Cannot reach server.'
        : err.message;
      onError(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <Input label="Username" id="username" type="text" placeholder="satoshi"
        value={fields.username} onChange={set('username')} error={errors.username} autoComplete="username" />
      <Input label="Email" id="reg-email" type="email" placeholder="you@example.com"
        value={fields.email} onChange={set('email')} error={errors.email} autoComplete="email" />
      <Input label="Password" id="reg-pass" type="password" placeholder="min 8 characters"
        value={fields.password} onChange={set('password')} error={errors.password} autoComplete="new-password" />
      <Button type="submit" fullWidth loading={loading}>Create account</Button>
    </form>
  );
}
