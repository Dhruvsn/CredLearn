import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Toast } from '../components/UI';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user, isDemo } = useAuth();
  const { toast, show } = useToast();

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <header className={`${styles.header} fade-up`}>
          <div>
            <h1 className={styles.title}>
              Hello, <em>{user?.username}</em>.
            </h1>
            <p className={styles.sub}>Your CredLearn economy at a glance.</p>
          </div>
          {isDemo && (
            <div className={styles.demoBanner}>
              <span className={styles.demoDot} />
              Demo mode — data is simulated
            </div>
          )}
        </header>

        {/* Stats row */}
        <div className={`${styles.statsGrid} fade-up fade-up-1`}>
          <StatCard label="SCX Balance" value={(user?.sc_balance ?? 500).toLocaleString()} unit="SkillCredit" accent="green" />
          <StatCard label="Wallet"      value={user?.wallet_address ? 'Connected' : 'Not linked'} unit="MetaMask" accent={user?.wallet_address ? 'green' : 'gray'} />
          <StatCard label="Network"     value="Ethereum" unit="Testnet / Mainnet" accent="blue" />
        </div>

        {/* Main grid */}
        <div className={`${styles.grid} fade-up fade-up-2`}>
          <ContractsCard />
          <WalletCard onToast={show} />
          <EscrowCard onToast={show} />
        </div>
      </main>
      <Toast toast={toast} />
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────── */
function StatCard({ label, value, unit, accent = 'gray' }) {
  return (
    <div className={`${styles.statCard} ${styles[`stat_${accent}`]}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${styles.statValue} ${styles[`statVal_${accent}`]}`}>{value}</div>
      <div className={styles.statUnit}>{unit}</div>
    </div>
  );
}

/* ── Contracts Card ────────────────────────────── */
function ContractsCard() {
  const contracts = [
    { name: 'SkillCredit (SCX)', desc: 'ERC20 · mintable · burnable', icon: '◈', color: 'accent' },
    { name: 'Escrow',            desc: 'Trustless session payments',   icon: '◉', color: 'blue' },
    { name: 'Treasury',          desc: 'Rewards · 5% platform fee',    icon: '◇', color: 'amber' },
  ];

  return (
    <Card className={styles.contractsCard}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Smart Contracts</span>
        <Badge color="accent">3 active</Badge>
      </div>
      <div className={styles.contractList}>
        {contracts.map(c => (
          <div key={c.name} className={styles.contractRow}>
            <div className={`${styles.contractIcon} ${styles[`cicon_${c.color}`]}`}>{c.icon}</div>
            <div className={styles.contractInfo}>
              <div className={styles.contractName}>{c.name}</div>
              <div className={styles.contractDesc}>{c.desc}</div>
            </div>
            <Badge color={c.color}>Live</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Wallet Card ──────────────────────────────── */
function WalletCard({ onToast }) {
  const { user, updateWallet } = useAuth();
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      onToast('MetaMask not detected. Install it to connect your wallet.', 'error');
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) {
        updateWallet(accounts[0]);
        onToast(`Wallet connected: ${accounts[0].slice(0,6)}…${accounts[0].slice(-4)}`, 'success');
      }
    } catch {
      onToast('Wallet connection cancelled.', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const addr = user?.wallet_address;

  return (
    <Card className={styles.walletCard}>
      <div className={styles.cardLabel} style={{ marginBottom: 16 }}>Wallet</div>

      {addr ? (
        <div className={styles.walletConnected}>
          <div className={styles.walletAvatar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2 8h20v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 8V6a2 2 0 012-2h16a2 2 0 012 2v2" stroke="var(--accent)" strokeWidth="1.5"/>
              <circle cx="17" cy="14" r="2" fill="var(--accent)" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <div className={styles.walletLabel}>Connected</div>
            <div className={styles.walletAddr}>{addr.slice(0,10)}…{addr.slice(-8)}</div>
          </div>
        </div>
      ) : (
        <Button variant="ghost" fullWidth loading={connecting} onClick={connect}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M2 8h20v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 8V6a2 2 0 012-2h16a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Connect MetaMask
        </Button>
      )}

      <p className={styles.walletNote}>
        Connect to interact with Escrow and Treasury contracts on-chain.
      </p>
    </Card>
  );
}

/* ── Escrow Card ──────────────────────────────── */
function EscrowCard({ onToast }) {
  const { user } = useAuth();
  const [fields, setFields] = useState({ tutor: '', amount: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setFields(f => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    if (!fields.tutor || !fields.amount) {
      onToast('Tutor address and amount are required.', 'error'); return;
    }
    if (isNaN(fields.amount) || Number(fields.amount) <= 0) {
      onToast('Amount must be a positive number.', 'error'); return;
    }
    if (!user?.wallet_address) {
      onToast('Connect your wallet first.', 'error'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900)); // simulate
    setLoading(false);
    setFields({ tutor: '', amount: '' });
    onToast('Escrow session created! (Deploy contracts to go live.)', 'success');
  };

  const steps = [
    'Learner approves SCX to Escrow contract',
    'createSession() locks tokens on-chain',
    'After session: learner completes → tutor paid; or tutor refunds → learner returned',
  ];

  return (
    <Card className={styles.escrowCard}>
      <div className={styles.cardLabel} style={{ marginBottom: 18 }}>Create Escrow Session</div>

      <div className={styles.escrowLayout}>
        <form className={styles.escrowForm} onSubmit={submit}>
          <div className={styles.escrowField}>
            <label className={styles.escrowLabel}>Tutor wallet address</label>
            <input
              className={styles.escrowInput}
              type="text" placeholder="0x..."
              value={fields.tutor} onChange={set('tutor')}
            />
          </div>
          <div className={styles.escrowField}>
            <label className={styles.escrowLabel}>SCX amount</label>
            <input
              className={styles.escrowInput}
              type="number" placeholder="50" min="1"
              value={fields.amount} onChange={set('amount')}
            />
          </div>
          <Button type="submit" loading={loading} style={{ alignSelf: 'flex-start' }}>
            Lock in Escrow →
          </Button>
        </form>

        <ol className={styles.escrowSteps}>
          {steps.map((s, i) => (
            <li key={i} className={styles.escrowStep}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
