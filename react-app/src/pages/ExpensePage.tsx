import React, { useEffect, useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useNotifications } from '../context/NotificationContext';
import DatePicker from '../components/DatePicker';
import CurrencyInput from '../components/CurrencyInput';
import ApprovalStatus from '../components/ApprovalStatus';
import { formatCurrency, formatDate } from '../utils/format';
import type { ExpenseCategory, ExpenseStatus } from '../types';

const COLORS = {
  primary: '#1a237e',
  accent: '#2196f3',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#f44336',
  card: '#fff',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 14,
  border: '1px solid #ccc',
  borderRadius: 4,
  boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 600,
  color: '#333',
};

type FilterStatus = 'all' | ExpenseStatus;

const CATEGORIES: ExpenseCategory[] = [
  'airfare', 'hotel', 'meals', 'ground_transport', 'car_rental',
  'fuel', 'parking', 'tolls', 'phone', 'internet',
  'conference_fees', 'supplies', 'tips', 'other',
];

interface ExpenseItemForm {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  vendor: string;
}

const emptyItem: ExpenseItemForm = {
  date: '',
  category: 'other',
  description: '',
  amount: 0,
  currency: 'USD',
  vendor: '',
};

const ExpensePage: React.FC = () => {
  const { reports, loading, error, dashboard, loadReports, submitReport, deleteReport } = useExpenses();
  const { addNotification } = useNotifications();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [travelRequestId, setTravelRequestId] = useState('');
  const [items, setItems] = useState<ExpenseItemForm[]>([]);
  const [currentItem, setCurrentItem] = useState<ExpenseItemForm>({ ...emptyItem });

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleAddItem = () => {
    if (!currentItem.description || !currentItem.date || currentItem.amount <= 0) {
      addNotification('Please fill in date, description, and amount.', 'warning');
      return;
    }
    setItems((prev) => [...prev, { ...currentItem }]);
    setCurrentItem({ ...emptyItem });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const itemsTotal = items.reduce((sum, it) => sum + it.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      addNotification('Add at least one expense item.', 'warning');
      return;
    }
    try {
      await submitReport({
        title,
        tripDestination,
        travelRequestId: travelRequestId || undefined,
        items: items.map((it) => ({
          date: it.date,
          category: it.category,
          description: it.description,
          amount: it.amount,
          currency: it.currency,
          vendor: it.vendor || undefined,
        })),
      });
      addNotification('Expense report submitted', 'success');
      resetForm();
    } catch {
      addNotification('Failed to submit report', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setTripDestination('');
    setTravelRequestId('');
    setItems([]);
    setCurrentItem({ ...emptyItem });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id);
      addNotification('Report deleted', 'success');
      setDeleteConfirmId(null);
    } catch {
      addNotification('Failed to delete report', 'error');
    }
  };

  // Category breakdown for current items
  const categoryBreakdown = useMemo(() => {
    const map: Partial<Record<ExpenseCategory, number>> = {};
    items.forEach((it) => { map[it.category] = (map[it.category] || 0) + it.amount; });
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...reports];
    if (filterStatus !== 'all') list = list.filter((r) => r.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) || r.tripDestination.toLowerCase().includes(q)
      );
    }
    if (dateFrom) list = list.filter((r) => r.createdAt >= dateFrom);
    if (dateTo) list = list.filter((r) => r.createdAt.slice(0, 10) <= dateTo);
    return list;
  }, [reports, filterStatus, search, dateFrom, dateTo]);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: COLORS.primary }}>💰 Expense Reports</h1>
        <button
          type="button"
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          style={{ padding: '8px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: showForm ? '#888' : COLORS.primary, border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : '+ New Report'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: COLORS.danger, padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>{error}</div>
      )}

      {/* Dashboard summary */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <SummaryCard label="Total Submitted" value={formatCurrency(dashboard.totalExpenses)} color={COLORS.primary} />
          <SummaryCard label="Approved This Month" value={formatCurrency(dashboard.approvedThisMonth)} color={COLORS.success} />
          <SummaryCard label="Pending Reimbursement" value={formatCurrency(dashboard.pendingReimbursement)} color={COLORS.warning} />
          <SummaryCard label="Rejected This Month" value={formatCurrency(dashboard.rejectedThisMonth)} color={COLORS.danger} />
          <SummaryCard label="Total Reports" value={String(reports.length)} color={COLORS.accent} />
          <SummaryCard
            label="Avg. Report Amount"
            value={reports.length > 0 ? formatCurrency(reports.reduce((s, r) => s + r.totalAmount, 0) / reports.length) : '$0.00'}
            color="#555"
          />
        </div>
      )}

      {/* New report form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: COLORS.card, borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, color: COLORS.primary }}>New Expense Report</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Report Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} placeholder="e.g. NYC Client Visit" />
            </div>
            <div>
              <label style={labelStyle}>Trip Destination *</label>
              <input value={tripDestination} onChange={(e) => setTripDestination(e.target.value)} required style={inputStyle} placeholder="e.g. New York" />
            </div>
            <div>
              <label style={labelStyle}>Travel Request ID</label>
              <input value={travelRequestId} onChange={(e) => setTravelRequestId(e.target.value)} style={inputStyle} placeholder="Optional link" />
            </div>
          </div>

          {/* Add expense item */}
          <h4 style={{ margin: '0 0 12px', fontSize: 14, color: COLORS.primary }}>Add Expense Items</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            <DatePicker label="Date *" value={currentItem.date} onChange={(v) => setCurrentItem({ ...currentItem, date: v })} />
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={currentItem.category} onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value as ExpenseCategory })} style={inputStyle}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <input value={currentItem.description} onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })} style={inputStyle} placeholder="What was this expense?" />
            </div>
            <CurrencyInput label="Amount *" value={currentItem.amount} onChange={(v) => setCurrentItem({ ...currentItem, amount: v })} />
            <div>
              <label style={labelStyle}>Vendor</label>
              <input value={currentItem.vendor} onChange={(e) => setCurrentItem({ ...currentItem, vendor: e.target.value })} style={inputStyle} placeholder="Optional" />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            style={{ padding: '6px 16px', fontSize: 13, fontWeight: 600, border: `1px solid ${COLORS.accent}`, borderRadius: 4, background: '#fff', color: COLORS.accent, cursor: 'pointer', marginBottom: 16 }}
          >
            + Add Item
          </button>

          {/* Items table */}
          {items.length > 0 && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                <thead>
                  <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Date</th>
                    <th style={{ padding: '8px 10px' }}>Category</th>
                    <th style={{ padding: '8px 10px' }}>Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '8px 10px' }}>Vendor</th>
                    <th style={{ padding: '8px 10px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px' }}>{formatDate(it.date, 'short')}</td>
                      <td style={{ padding: '8px 10px', textTransform: 'capitalize' }}>{it.category.replace(/_/g, ' ')}</td>
                      <td style={{ padding: '8px 10px' }}>{it.description}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(it.amount)}</td>
                      <td style={{ padding: '8px 10px' }}>{it.vendor || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <button type="button" onClick={() => handleRemoveItem(i)} style={{ padding: '2px 8px', fontSize: 11, color: COLORS.danger, background: '#fff', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer' }}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Category breakdown */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                {Object.entries(categoryBreakdown).map(([cat, amt]) => (
                  <span key={cat} style={{ fontSize: 12, background: '#e3f2fd', color: '#1565c0', padding: '3px 8px', borderRadius: 4, textTransform: 'capitalize' }}>
                    {cat.replace(/_/g, ' ')}: {formatCurrency(amt)}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary, marginBottom: 16 }}>
                Total: {formatCurrency(itemsTotal)}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: loading || items.length === 0 ? '#999' : COLORS.primary, border: 'none', borderRadius: 6, cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
            <button type="button" onClick={resetForm} style={{ padding: '10px 24px', fontSize: 14, border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ ...labelStyle, marginBottom: 2 }}>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} style={{ ...inputStyle, width: 150 }}>
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reimbursed">Reimbursed</option>
          </select>
        </div>
        <div>
          <label style={{ ...labelStyle, marginBottom: 2 }}>Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or destination…" style={{ ...inputStyle, width: 200 }} />
        </div>
        <div>
          <DatePicker label="From" value={dateFrom} onChange={setDateFrom} />
        </div>
        <div>
          <DatePicker label="To" value={dateTo} onChange={setDateTo} />
        </div>
      </div>

      {/* Reports list */}
      {loading && reports.length === 0 && <p style={{ color: '#888' }}>Loading…</p>}
      {!loading && filtered.length === 0 && (
        <div style={{ background: COLORS.card, borderRadius: 10, padding: 32, textAlign: 'center', color: '#888', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>💰</p>
          <p>No expense reports found.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: COLORS.card, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <thead>
              <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Title</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Destination</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Items</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Submitted</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr key={report.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{report.title}</td>
                  <td style={{ padding: '10px 14px' }}>{report.tripDestination}</td>
                  <td style={{ padding: '10px 14px' }}>{report.items.length}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(report.totalAmount)}</td>
                  <td style={{ padding: '10px 14px' }}><ApprovalStatus status={report.status} size="sm" /></td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    {report.submittedAt ? formatDate(report.submittedAt, 'short') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {deleteConfirmId === report.id ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: COLORS.danger }}>Delete?</span>
                        <button type="button" onClick={() => handleDelete(report.id)} style={{ padding: '2px 8px', fontSize: 11, background: COLORS.danger, color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Yes</button>
                        <button type="button" onClick={() => setDeleteConfirmId(null)} style={{ padding: '2px 8px', fontSize: 11, background: '#eee', border: 'none', borderRadius: 3, cursor: 'pointer' }}>No</button>
                      </div>
                    ) : (
                      (report.status === 'draft' || report.status === 'submitted') && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(report.id)}
                          style={{ padding: '3px 10px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: COLORS.danger, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Small helper component for dashboard cards
const SummaryCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: COLORS.card,
    borderRadius: 10,
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
  </div>
);

export default ExpensePage;
