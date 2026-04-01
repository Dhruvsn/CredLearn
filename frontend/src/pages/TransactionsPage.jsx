import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Toast } from '../components/UI';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import styles from './TransactionsPage.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function TransactionsPage() {
  const { user, token, isDemo, DEMO_TXS } = useAuth();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast, show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (isDemo) {
      await new Promise(r => setTimeout(r, 600));
      setTxs(DEMO_TXS);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/user/${user.id}/transaction`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setTxs(data.data || []);
    } catch (e) {
      setError(e.message);
      show('Failed to load transactions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, token, isDemo, DEMO_TXS, show]);

  useEffect(() => { load(); }, [load]);

  const sent  = txs.filter(t => t.sender_id   === user?.id).reduce((a, t) => a + t.amount, 0);
  const recv  = txs.filter(t => t.receiver_id === user?.id).reduce((a, t) => a + t.amount, 0);
  const net   = recv - sent;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={`${styles.header} fade-up`}>
          <div>
            <h1 className={styles.title}>Transactions</h1>
            <p className={styles.sub}>On-chain SCX transfers linked to your account.</p>
          </div>
          <Button variant="ghost" onClick={load} loading={loading} style={{ fontSize: '13px' }}>
            ↻ Refresh
          </Button>
        </div>

        {/* Summary row */}
        {!loading && txs.length > 0 && (
          <div className={`${styles.summary} fade-up fade-up-1`}>
            <SummaryChip label="Total received" value={`+${recv.toLocaleString()} SCX`} color="green" />
            <SummaryChip label="Total sent"     value={`−${sent.toLocaleString()} SCX`} color="red" />
            <SummaryChip label="Net flow"        value={`${net >= 0 ? '+' : ''}${net.toLocaleString()} SCX`} color={net >= 0 ? 'green' : 'red'} />
            <SummaryChip label="Transactions"    value={txs.length} color="gray" />
          </div>
        )}

        {/* Table */}
        <div className={`${styles.tableCard} fade-up fade-up-2`}>
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <EmptyState icon="⛓" title="Could not load transactions" sub={error} />
          ) : txs.length === 0 ? (
            <EmptyState icon="📭" title="No transactions yet" sub="Transactions will appear here after sessions." />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Counterparty</th>
                  <th>Amount</th>
                  <th>Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {txs.map(tx => (
                  <TxRow key={tx.id} tx={tx} userId={user?.id} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Toast toast={toast} />
    </div>
  );
}

/* ── Tx Row ──────────────────────────────────── */
function TxRow({ tx, userId }) {
  const isSent = tx.sender_id === userId;
  const peer   = isSent ? tx.receiver_id : tx.sender_id;
  const peerFmt = peer
    ? (peer.length > 20 ? peer.slice(0, 10) + '…' + peer.slice(-6) : peer)
    : '—';
  const hashFmt = tx.blockchain_hash
    ? tx.blockchain_hash.slice(0, 10) + '…' + tx.blockchain_hash.slice(-6)
    : '—';
  const d = new Date(tx.created_at);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <tr className={styles.row}>
      <td>
        <span className={styles.date}>{date}</span>
        <span className={styles.time}> {time}</span>
      </td>
      <td>
        <span className={`${styles.typeBadge} ${isSent ? styles.typeSent : styles.typeRecv}`}>
          {isSent ? '↑ Sent' : '↓ Received'}
        </span>
      </td>
      <td className={styles.peer}>{peerFmt}</td>
      <td>
        <span className={`${styles.amount} ${isSent ? styles.amountSent : styles.amountRecv}`}>
          {isSent ? '−' : '+'}{tx.amount.toLocaleString()} SCX
        </span>
      </td>
      <td>
        <span className={styles.hash} title={tx.blockchain_hash}>{hashFmt}</span>
      </td>
    </tr>
  );
}

/* ── Summary Chip ──────────────────────────── */
function SummaryChip({ label, value, color }) {
  return (
    <div className={`${styles.chip} ${styles[`chip_${color}`]}`}>
      <div className={styles.chipLabel}>{label}</div>
      <div className={styles.chipValue}>{value}</div>
    </div>
  );
}

/* ── Empty / Skeleton ──────────────────────── */
function EmptyState({ icon, title, sub }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      <div className={styles.emptySub}>{sub}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className={styles.skeletonWrap}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className="skeleton" style={{ width: '80px', height: '14px' }} />
          <div className="skeleton" style={{ width: '60px', height: '14px' }} />
          <div className="skeleton" style={{ width: '120px', height: '14px' }} />
          <div className="skeleton" style={{ width: '70px', height: '14px' }} />
          <div className="skeleton" style={{ width: '100px', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}
