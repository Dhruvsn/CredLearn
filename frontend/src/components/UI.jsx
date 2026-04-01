import styles from './UI.module.css';

/* ── Button ─────────────────────────────── */
export function Button({ children, variant = 'primary', loading, disabled, fullWidth, onClick, type = 'button', style }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${fullWidth ? styles.fullWidth : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
    >
      {loading && <span className={styles.btnSpinner} />}
      {children}
    </button>
  );
}

/* ── Input ───────────────────────────────── */
export function Input({ label, id, error, ...props }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input id={id} className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

/* ── Card ────────────────────────────────── */
export function Card({ children, className = '', style }) {
  return <div className={`${styles.card} ${className}`} style={style}>{children}</div>;
}

/* ── Badge ───────────────────────────────── */
export function Badge({ children, color = 'accent' }) {
  return <span className={`${styles.badge} ${styles[`badge_${color}`]}`}>{children}</span>;
}

/* ── Toast ───────────────────────────────── */
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`} key={toast.id}>
      <span className={styles.toastDot} />
      {toast.message}
    </div>
  );
}

/* ── Divider ─────────────────────────────── */
export function Divider({ label }) {
  if (!label) return <hr className={styles.divider} />;
  return (
    <div className={styles.dividerLabel}>
      <hr className={styles.divider} />
      <span>{label}</span>
      <hr className={styles.divider} />
    </div>
  );
}
