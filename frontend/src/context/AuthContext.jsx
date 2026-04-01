import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'demo-uuid-0000-0000-0000-credlearn',
  username: 'satoshi',
  email: 'satoshi@credlearn.io',
  sc_balance: 500,
  wallet_address: null,
};

const DEMO_TXS = [
  { id: '1', sender_id: 'other-uuid', receiver_id: DEMO_USER.id, amount: 120, blockchain_hash: '0xabc123def456abc123def456abc123def456abc1', created_at: new Date(Date.now() - 3_600_000).toISOString() },
  { id: '2', sender_id: DEMO_USER.id, receiver_id: 'tutor-uuid', amount: 50,  blockchain_hash: '0xdef456abc123def456abc123def456abc123def4', created_at: new Date(Date.now() - 86_400_000).toISOString() },
  { id: '3', sender_id: 'other-uuid', receiver_id: DEMO_USER.id, amount: 75,  blockchain_hash: '0x789abcdef012789abcdef012789abcdef0127891', created_at: new Date(Date.now() - 172_800_000).toISOString() },
  { id: '4', sender_id: DEMO_USER.id, receiver_id: 'learner-uuid', amount: 200, blockchain_hash: '0x321fedcba987321fedcba987321fedcba987321f', created_at: new Date(Date.now() - 259_200_000).toISOString() },
  { id: '5', sender_id: 'treasury-uuid', receiver_id: DEMO_USER.id, amount: 95, blockchain_hash: '0xffe123cba456ffe123cba456ffe123cba456ffe1', created_at: new Date(Date.now() - 345_600_000).toISOString() },
];

function loadSession() {
  try {
    const s = localStorage.getItem('credlearn_session');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const saved = loadSession();
  const [user,  setUser]  = useState(saved?.user  || null);
  const [token, setToken] = useState(saved?.token || null);
  const [isDemo, setIsDemo] = useState(saved?.isDemo || false);

  const persist = useCallback((u, t, demo = false) => {
    setUser(u); setToken(t); setIsDemo(demo);
    localStorage.setItem('credlearn_session', JSON.stringify({ user: u, token: t, isDemo: demo }));
  }, []);

  const login = useCallback((data) => {
    persist(data.user, data.token, false);
  }, [persist]);

  const demo = useCallback(() => {
    persist(DEMO_USER, 'demo', true);
  }, [persist]);

  const logout = useCallback(() => {
    setUser(null); setToken(null); setIsDemo(false);
    localStorage.removeItem('credlearn_session');
  }, []);

  const updateWallet = useCallback((address) => {
    const updated = { ...user, wallet_address: address };
    setUser(updated);
    localStorage.setItem('credlearn_session', JSON.stringify({ user: updated, token, isDemo }));
  }, [user, token, isDemo]);

  return (
    <AuthContext.Provider value={{ user, token, isDemo, login, demo, logout, updateWallet, DEMO_TXS }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
