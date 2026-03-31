import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ─── Config ──────────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.STRAPI_ADMIN_NODE_API_URL || 'http://localhost:4000';

// ─── Storage helpers ──────────────────────────────────────────────────────────
function setStoredToken(t: string) {
  try { localStorage.setItem('pw_provider_token', t); } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Provider {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNo: string;
  email?: string;
  profileImage?: string;
  isActive: boolean;
  userType: string;
  refrenceCode?: string;
  createdAt: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .pw-root {
    font-family: 'Inter', sans-serif;
    padding: 32px;
    background: #F7F8FA;
    min-height: 100vh;
  }
  .pw-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .pw-title {
    font-size: 26px;
    font-weight: 800;
    color: #1E1B4B;
    margin: 0;
  }
  .pw-subtitle {
    font-size: 14px;
    color: #6B7280;
    margin: 4px 0 0;
  }
  .pw-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.18s;
  }
  .pw-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .pw-btn-primary { background: #6366F1; color: #fff; }
  .pw-btn-primary:hover:not(:disabled) { background: #4F46E5; }
  .pw-btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
  .pw-btn-activate { background: #DCFCE7; color: #16A34A; }
  .pw-btn-activate:hover { background: #BBF7D0; }
  .pw-btn-deactivate { background: #FEE2E2; color: #DC2626; }
  .pw-btn-deactivate:hover { background: #FECACA; }
  .pw-btn-ghost { background: #F3F4F6; color: #374151; }
  .pw-btn-ghost:hover { background: #E5E7EB; }

  /* Stats Bar */
  .pw-stats { display: flex; gap: 16px; margin-bottom: 24px; }
  .pw-stat-card {
    flex: 1; background: #fff; border-radius: 14px;
    padding: 18px 22px; border: 1px solid #E5E7EB;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .pw-stat-label { font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .pw-stat-value { font-size: 30px; font-weight: 800; color: #1E1B4B; margin-top: 4px; }
  .pw-stat-active .pw-stat-value { color: #16A34A; }
  .pw-stat-inactive .pw-stat-value { color: #DC2626; }

  /* Search */
  .pw-search-wrap { display: flex; gap: 12px; margin-bottom: 20px; }
  .pw-search {
    flex: 1; padding: 10px 16px; border: 1.5px solid #E5E7EB;
    border-radius: 10px; font-size: 14px; background: #fff;
    color: #111827; outline: none; transition: border 0.18s;
  }
  .pw-search:focus { border-color: #6366F1; }

  /* Table */
  .pw-table-wrap {
    background: #fff; border-radius: 16px; border: 1px solid #E5E7EB;
    overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  }
  .pw-table { width: 100%; border-collapse: collapse; }
  .pw-table th {
    background: #F9FAFB; padding: 13px 18px; text-align: left;
    font-size: 12px; font-weight: 700; color: #6B7280;
    text-transform: uppercase; letter-spacing: 0.5px;
    border-bottom: 1px solid #E5E7EB;
  }
  .pw-table td {
    padding: 14px 18px; font-size: 14px; color: #111827;
    border-bottom: 1px solid #F3F4F6; vertical-align: middle;
  }
  .pw-table tr:last-child td { border-bottom: none; }
  .pw-table tr:hover td { background: #F9FAFB; }

  .pw-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: #EEF2FF; color: #6366F1; font-weight: 800;
    font-size: 15px; display: flex; align-items: center; justify-content: center;
  }
  .pw-name-cell { display: flex; align-items: center; gap: 12px; }
  .pw-name { font-weight: 600; }
  .pw-ref { font-size: 11px; color: #9CA3AF; margin-top: 1px; }

  .pw-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
  }
  .pw-badge-active { background: #DCFCE7; color: #16A34A; }
  .pw-badge-inactive { background: #FEE2E2; color: #DC2626; }
  .pw-dot { width: 7px; height: 7px; border-radius: 50%; }
  .pw-dot-active { background: #16A34A; }
  .pw-dot-inactive { background: #DC2626; }
  .pw-actions { display: flex; gap: 8px; }

  /* Empty */
  .pw-empty { padding: 64px 0; text-align: center; color: #9CA3AF; }
  .pw-empty-icon { font-size: 48px; margin-bottom: 12px; }
  .pw-empty-title { font-size: 18px; font-weight: 700; color: #374151; }
  .pw-empty-sub { margin-top: 4px; font-size: 14px; }

  /* Modal */
  .pw-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; backdrop-filter: blur(2px);
  }
  .pw-modal {
    background: #fff; border-radius: 20px; padding: 32px;
    width: 480px; max-width: 95vw;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18); position: relative;
  }
  .pw-modal-title { font-size: 22px; font-weight: 800; color: #1E1B4B; margin: 0 0 6px; }
  .pw-modal-sub { font-size: 13px; color: #6B7280; margin: 0 0 24px; line-height: 1.6; }
  .pw-modal-close {
    position: absolute; top: 16px; right: 16px;
    background: #F3F4F6; border: none; border-radius: 8px;
    width: 32px; height: 32px; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
  }
  .pw-row { display: flex; gap: 12px; }
  .pw-field { margin-bottom: 16px; flex: 1; }
  .pw-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .pw-label-opt { color: #9CA3AF; font-weight: 400; }
  .pw-input {
    width: 100%; padding: 11px 14px; border: 1.5px solid #E5E7EB;
    border-radius: 10px; font-size: 14px; color: #111827;
    background: #FAFAFA; box-sizing: border-box; outline: none;
    transition: border 0.18s; font-family: 'Inter', sans-serif;
  }
  .pw-input:focus { border-color: #6366F1; background: #fff; }
  .pw-input-error { border-color: #EF4444 !important; }
  .pw-err { color: #EF4444; font-size: 11px; margin-top: 4px; }
  .pw-modal-actions { display: flex; gap: 10px; margin-top: 8px; }
  .pw-modal-actions .pw-btn { flex: 1; justify-content: center; }

  /* Login card */
  .pw-login-wrap {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; background: #F7F8FA;
  }
  .pw-login-card {
    background: #fff; border-radius: 20px; padding: 40px;
    width: 420px; max-width: 95vw;
    box-shadow: 0 8px 32px rgba(99,102,241,0.10); border: 1px solid #E5E7EB;
  }
  .pw-login-logo { font-size: 36px; margin-bottom: 8px; }
  .pw-login-title { font-size: 24px; font-weight: 800; color: #1E1B4B; margin: 0 0 4px; }
  .pw-login-sub { font-size: 14px; color: #6B7280; margin: 0 0 28px; }
  .pw-login-divider {
    border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;
  }

  .pw-alert { padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
  .pw-alert-info { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; }
  .pw-alert-success { background: #DCFCE7; color: #16A34A; border: 1px solid #86EFAC; }
  .pw-alert-error { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }

  .pw-loading { text-align: center; padding: 48px; color: #9CA3AF; font-size: 15px; }

  .pw-user-pill {
    display: flex; align-items: center; gap: 10px;
    background: #EEF2FF; border-radius: 10px; padding: 10px 14px;
    margin-bottom: 20px;
  }
  .pw-user-pill-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #6366F1; color: #fff; font-weight: 800;
    font-size: 13px; display: flex; align-items: center; justify-content: center;
  }
  .pw-user-pill-name { font-size: 13px; font-weight: 600; color: #1E1B4B; }
  .pw-user-pill-phone { font-size: 11px; color: #6B7280; }
  .pw-user-pill-logout {
    margin-left: auto; background: none; border: none;
    color: #6366F1; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0;
  }
  .pw-user-pill-logout:hover { text-decoration: underline; }
`;

// ─── API helpers ──────────────────────────────────────────────────────────────
async function loginWithPhone(phoneNo: string): Promise<{ token: string; user: any }> {
  const res = await axios.post(`${BACKEND_URL}/api/v2/auth/login`, {
    phoneNo,
    userType: 'manager',
  });
  const token = res.data?.data?.tokens?.accessToken;
  const user = res.data?.data?.user;
  if (!token) throw new Error('No access token returned');
  if (user?.userType !== 'manager') {
    throw new Error('Access denied. Only manager accounts can access this panel.');
  }
  return { token, user };
}

function api(token: string) {
  return axios.create({
    baseURL: `${BACKEND_URL}/api/v2`,
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function fetchProviders(token: string): Promise<Provider[]> {
  const res = await api(token).get('/user/provider');
  return res.data?.data?.providers ?? [];
}

async function createProvider(token: string, data: any): Promise<Provider> {
  const res = await api(token).post('/user/provider', data);
  return res.data?.data?.provider;
}

async function toggleStatus(token: string, id: string): Promise<Provider> {
  const res = await api(token).patch(`/user/provider/${id}/status`);
  return res.data?.data?.provider;
}

// ─── Stored session ───────────────────────────────────────────────────────────
interface Session { token: string; user: any }
function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem('pw_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setStoredSession(s: Session) {
  try { localStorage.setItem('pw_session', JSON.stringify(s)); } catch {}
}
function clearStoredSession() {
  try { localStorage.removeItem('pw_session'); localStorage.removeItem('pw_provider_token'); } catch {}
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (session: Session) => void }) {
  const [phoneNo, setPhoneNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = phoneNo.trim();
    if (!phone) { setError('Phone number is required'); return; }
    setLoading(true);
    setError('');
    try {
      const session = await loginWithPhone(phone);
      setStoredSession(session);
      setStoredToken(session.token);
      onLogin(session);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Check the phone number and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pw-login-wrap">
      <style>{css}</style>
      <div className="pw-login-card">
        <div className="pw-login-logo">🔐</div>
        <h2 className="pw-login-title">Admin Sign In</h2>
        <p className="pw-login-sub">Sign in with your manager phone number to access the Provider Whitelist panel.</p>

        {error && <div className="pw-alert pw-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="pw-field">
            <label className="pw-label">Phone Number</label>
            <input
              className="pw-input"
              type="tel"
              placeholder="+919824157811"
              value={phoneNo}
              onChange={e => { setPhoneNo(e.target.value); setError(''); }}
              autoFocus
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="pw-btn pw-btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? 'Signing in...' : '🔐 Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState<Session | null>(getStoredSession);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNo: '', email: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async (token: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProviders(token);
      setProviders(data);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        setError('Session expired. Please sign in again.');
        clearStoredSession();
        setSession(null);
      } else {
        setError(e?.response?.data?.message || 'Failed to load providers. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.token) load(session.token);
  }, [session, load]);

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    setProviders([]);
  };

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filtered = providers.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phoneNo.includes(q) ||
      (p.email || '').toLowerCase().includes(q);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && p.isActive) ||
      (filterStatus === 'inactive' && !p.isActive);
    return matchSearch && matchStatus;
  });

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.isActive).length,
    inactive: providers.filter(p => !p.isActive).length,
  };

  // ── Toggle ───────────────────────────────────────────────────────────────────
  const handleToggle = async (p: Provider) => {
    setTogglingId(p._id);
    try {
      const updated = await toggleStatus(session.token, p._id);
      setProviders(prev => prev.map(x => x._id === p._id ? updated : x));
    } catch (e: any) {
      alert('Error: ' + (e?.response?.data?.message || 'Failed to update status'));
    } finally {
      setTogglingId(null);
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.phoneNo.trim() || !/^\+?[0-9]{10,15}$/.test(form.phoneNo.trim()))
      errs.phoneNo = 'Enter 10–15 digit number (e.g. +919824157811)';
    return errs;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const p = await createProvider(session.token, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNo: form.phoneNo.trim(),
        email: form.email.trim() || undefined,
      });
      setProviders(prev => [p, ...prev]);
      setSuccessMsg(`✅ ${form.firstName} ${form.lastName} has been whitelisted!`);
      setForm({ firstName: '', lastName: '', phoneNo: '', email: '' });
      setFormErrors({});
      setShowModal(false);
    } catch (e: any) {
      alert('Error: ' + (e?.response?.data?.message || 'Failed to whitelist provider.'));
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (p: Provider) =>
    `${p.firstName[0] || ''}${p.lastName[0] || ''}`.toUpperCase();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const userInitials = session.user
    ? `${session.user.firstName?.[0] || ''}${session.user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="pw-root">
      <style>{css}</style>

      {/* Header */}
      <div className="pw-header">
        <div>
          <h1 className="pw-title">👷 Provider Whitelist</h1>
          <p className="pw-subtitle">Whitelist, activate and deactivate service providers</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Logged-in user pill */}
          <div className="pw-user-pill">
            <div className="pw-user-pill-avatar">{userInitials}</div>
            <div>
              <div className="pw-user-pill-name">
                {session.user?.firstName} {session.user?.lastName}
              </div>
              <div className="pw-user-pill-phone">{session.user?.phoneNo}</div>
            </div>
            <button className="pw-user-pill-logout" onClick={handleLogout}>Sign out</button>
          </div>
          <button className="pw-btn pw-btn-ghost" onClick={() => load(session.token)}>↻ Refresh</button>
          <button className="pw-btn pw-btn-primary" onClick={() => { setShowModal(true); setSuccessMsg(''); }}>
            + Whitelist Provider
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && <div className="pw-alert pw-alert-success" style={{ marginBottom: 20 }}>{successMsg}</div>}
      {error && <div className="pw-alert pw-alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats */}
      <div className="pw-stats">
        <div className="pw-stat-card">
          <div className="pw-stat-label">Total Providers</div>
          <div className="pw-stat-value">{stats.total}</div>
        </div>
        <div className="pw-stat-card pw-stat-active">
          <div className="pw-stat-label">Active</div>
          <div className="pw-stat-value">{stats.active}</div>
        </div>
        <div className="pw-stat-card pw-stat-inactive">
          <div className="pw-stat-label">Inactive</div>
          <div className="pw-stat-value">{stats.inactive}</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="pw-search-wrap">
        <input
          className="pw-search"
          placeholder="🔍  Search by name, phone or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            className={`pw-btn pw-btn-sm ${filterStatus === f ? 'pw-btn-primary' : 'pw-btn-ghost'}`}
            onClick={() => setFilterStatus(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="pw-table-wrap">
        {loading ? (
          <div className="pw-loading">Loading providers...</div>
        ) : filtered.length === 0 ? (
          <div className="pw-empty">
            <div className="pw-empty-icon">👷</div>
            <div className="pw-empty-title">
              {search || filterStatus !== 'all' ? 'No matching providers' : 'No Providers Yet'}
            </div>
            <div className="pw-empty-sub">
              {search || filterStatus !== 'all'
                ? 'Try a different search or filter.'
                : 'Click "Whitelist Provider" to add the first one.'}
            </div>
          </div>
        ) : (
          <table className="pw-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Ref Code</th>
                <th>Added On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="pw-name-cell">
                      <div className="pw-avatar">{initials(p)}</div>
                      <div>
                        <div className="pw-name">{p.firstName} {p.lastName}</div>
                        <div className="pw-ref">{p._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.phoneNo}</td>
                  <td>{p.email || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                  <td>
                    <code style={{ background: '#F3F4F6', padding: '2px 7px', borderRadius: 6, fontSize: 12 }}>
                      {p.refrenceCode || '—'}
                    </code>
                  </td>
                  <td style={{ color: '#6B7280', fontSize: 13 }}>{formatDate(p.createdAt)}</td>
                  <td>
                    <span className={`pw-badge ${p.isActive ? 'pw-badge-active' : 'pw-badge-inactive'}`}>
                      <span className={`pw-dot ${p.isActive ? 'pw-dot-active' : 'pw-dot-inactive'}`} />
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="pw-actions">
                      {togglingId === p._id ? (
                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>Updating...</span>
                      ) : (
                        <button
                          className={`pw-btn pw-btn-sm ${p.isActive ? 'pw-btn-deactivate' : 'pw-btn-activate'}`}
                          onClick={() => handleToggle(p)}
                        >
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Whitelist Modal */}
      {showModal && (
        <div className="pw-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="pw-modal">
            <button className="pw-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="pw-modal-title">Whitelist New Provider</h2>
            <p className="pw-modal-sub">
              Adding a provider gives them access to log into the Radix app and receive service jobs.
              No OTP required — this is a direct admin action.
            </p>
            <form onSubmit={handleCreate}>
              <div className="pw-row">
                <div className="pw-field">
                  <label className="pw-label">First Name *</label>
                  <input
                    className={`pw-input ${formErrors.firstName ? 'pw-input-error' : ''}`}
                    placeholder="e.g. Ravi"
                    value={form.firstName}
                    onChange={e => { setForm(f => ({ ...f, firstName: e.target.value })); setFormErrors(fe => ({ ...fe, firstName: '' })); }}
                  />
                  {formErrors.firstName && <div className="pw-err">{formErrors.firstName}</div>}
                </div>
                <div className="pw-field">
                  <label className="pw-label">Last Name *</label>
                  <input
                    className={`pw-input ${formErrors.lastName ? 'pw-input-error' : ''}`}
                    placeholder="e.g. Sharma"
                    value={form.lastName}
                    onChange={e => { setForm(f => ({ ...f, lastName: e.target.value })); setFormErrors(fe => ({ ...fe, lastName: '' })); }}
                  />
                  {formErrors.lastName && <div className="pw-err">{formErrors.lastName}</div>}
                </div>
              </div>
              <div className="pw-field">
                <label className="pw-label">Phone Number *</label>
                <input
                  className={`pw-input ${formErrors.phoneNo ? 'pw-input-error' : ''}`}
                  placeholder="+919824157811"
                  value={form.phoneNo}
                  onChange={e => { setForm(f => ({ ...f, phoneNo: e.target.value })); setFormErrors(fe => ({ ...fe, phoneNo: '' })); }}
                />
                {formErrors.phoneNo && <div className="pw-err">{formErrors.phoneNo}</div>}
              </div>
              <div className="pw-field">
                <label className="pw-label">Email <span className="pw-label-opt">(optional)</span></label>
                <input
                  className="pw-input"
                  type="email"
                  placeholder="ravi@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="pw-modal-actions">
                <button type="button" className="pw-btn pw-btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pw-btn pw-btn-primary" disabled={submitting}>
                  {submitting ? 'Whitelisting...' : '✅ Whitelist Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
