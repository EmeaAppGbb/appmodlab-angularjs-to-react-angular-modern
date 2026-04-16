import React, { useEffect, useState, useMemo } from 'react';
import { useTravelRequests } from '../hooks/useTravelRequests';
import { useNotifications } from '../context/NotificationContext';
import DatePicker from '../components/DatePicker';
import CurrencyInput from '../components/CurrencyInput';
import ApprovalStatus from '../components/ApprovalStatus';
import { formatCurrency, formatDate } from '../utils/format';
import type { TravelRequest, TravelRequestStatus } from '../types';

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

type FilterStatus = 'all' | TravelRequestStatus;

interface CostBreakdown {
  flights: number;
  hotels: number;
  meals: number;
  transportation: number;
  other: number;
}

const emptyForm = {
  destination: '',
  departureDate: '',
  returnDate: '',
  purpose: '',
  department: '',
  projectCode: '',
  justification: '',
};

const emptyCosts: CostBreakdown = { flights: 0, hotels: 0, meals: 0, transportation: 0, other: 0 };

const TravelRequestPage: React.FC = () => {
  const { requests, loading, error, loadRequests, submitRequest, updateRequest, cancelRequest } = useTravelRequests();
  const { addNotification } = useNotifications();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [costs, setCosts] = useState<CostBreakdown>({ ...emptyCosts });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const today = new Date().toISOString().split('T')[0];
  const totalCost = costs.flights + costs.hotels + costs.meals + costs.transportation + costs.other;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      destination: form.destination,
      departureDate: form.departureDate,
      returnDate: form.returnDate,
      purpose: form.purpose + (form.justification ? `\n\nJustification: ${form.justification}` : ''),
      department: form.department,
      projectCode: form.projectCode || undefined,
      estimatedCosts: { ...costs, total: totalCost, currency: 'USD' },
    };
    try {
      if (editingId) {
        await updateRequest(editingId, data);
        addNotification('Request updated', 'success');
      } else {
        await submitRequest(data);
        addNotification('Request submitted', 'success');
      }
      resetForm();
    } catch {
      addNotification('Failed to save request', 'error');
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setCosts({ ...emptyCosts });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (req: TravelRequest) => {
    setForm({
      destination: req.destination,
      departureDate: req.departureDate,
      returnDate: req.returnDate,
      purpose: req.purpose,
      department: req.department,
      projectCode: req.projectCode ?? '',
      justification: '',
    });
    setCosts({
      flights: req.estimatedCosts.flights,
      hotels: req.estimatedCosts.hotels,
      meals: req.estimatedCosts.meals,
      transportation: req.estimatedCosts.transportation,
      other: req.estimatedCosts.other,
    });
    setEditingId(req.id);
    setShowForm(true);
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this travel request?')) return;
    try {
      await cancelRequest(id);
      addNotification('Request cancelled', 'success');
    } catch {
      addNotification('Failed to cancel request', 'error');
    }
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: requests.length, pending: 0, approved: 0, rejected: 0, draft: 0, cancelled: 0 };
    requests.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [requests]);

  const filtered = useMemo(() => {
    let list = [...requests];
    if (filterStatus !== 'all') list = list.filter((r) => r.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.destination.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, filterStatus, search]);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: COLORS.primary }}>📝 Travel Requests</h1>
        <button
          type="button"
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          style={{ padding: '8px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: showForm ? '#888' : COLORS.primary, border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: COLORS.danger, padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>{error}</div>
      )}

      {/* Status counts */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as FilterStatus[]).map((s) => (
          <div
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: filterStatus === s ? COLORS.accent : COLORS.card,
              color: filterStatus === s ? '#fff' : '#333',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'capitalize',
            }}
          >
            {s} ({statusCounts[s] || 0})
          </div>
        ))}
      </div>

      {/* New / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: COLORS.card, borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, color: COLORS.primary }}>
            {editingId ? 'Edit Request' : 'New Travel Request'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Destination *</label>
              <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required style={inputStyle} placeholder="e.g. London, UK" />
            </div>
            <div>
              <label style={labelStyle}>Department *</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required style={inputStyle} placeholder="e.g. Engineering" />
            </div>
            <DatePicker label="Departure Date *" value={form.departureDate} onChange={(v) => setForm({ ...form, departureDate: v })} min={today} required />
            <DatePicker label="Return Date *" value={form.returnDate} onChange={(v) => setForm({ ...form, returnDate: v })} min={form.departureDate || today} required />
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Purpose *</label>
              <textarea
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                required
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Brief description of travel purpose"
              />
            </div>
            <div>
              <label style={labelStyle}>Project Code</label>
              <input value={form.projectCode} onChange={(e) => setForm({ ...form, projectCode: e.target.value })} style={inputStyle} placeholder="Optional" />
            </div>
            <div>
              <label style={labelStyle}>Business Justification</label>
              <textarea
                value={form.justification}
                onChange={(e) => setForm({ ...form, justification: e.target.value })}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Why is this travel necessary?"
              />
            </div>
          </div>

          {/* Cost breakdown */}
          <h4 style={{ margin: '20px 0 12px', fontSize: 14, color: COLORS.primary }}>Estimated Cost Breakdown</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <CurrencyInput label="Flights" value={costs.flights} onChange={(v) => setCosts({ ...costs, flights: v })} />
            <CurrencyInput label="Hotels" value={costs.hotels} onChange={(v) => setCosts({ ...costs, hotels: v })} />
            <CurrencyInput label="Meals" value={costs.meals} onChange={(v) => setCosts({ ...costs, meals: v })} />
            <CurrencyInput label="Transport" value={costs.transportation} onChange={(v) => setCosts({ ...costs, transportation: v })} />
            <CurrencyInput label="Other" value={costs.other} onChange={(v) => setCosts({ ...costs, other: v })} />
          </div>
          <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: COLORS.primary }}>
            Estimated Total: {formatCurrency(totalCost)}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: loading ? '#999' : COLORS.primary, border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving…' : editingId ? 'Update Request' : 'Submit Request'}
            </button>
            <button type="button" onClick={resetForm} style={{ padding: '10px 24px', fontSize: 14, border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search requests…"
          style={{ ...inputStyle, maxWidth: 360 }}
        />
      </div>

      {/* Requests table */}
      {loading && requests.length === 0 && <p style={{ color: '#888' }}>Loading…</p>}
      {!loading && filtered.length === 0 && (
        <div style={{ background: COLORS.card, borderRadius: 10, padding: 32, textAlign: 'center', color: '#888', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>📝</p>
          <p>No travel requests found.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: COLORS.card, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <thead>
              <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Destination</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Dates</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Purpose</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Department</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555', textAlign: 'right' }}>Est. Cost</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: '#555' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{req.destination}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    {formatDate(req.departureDate, 'short')} – {formatDate(req.returnDate, 'short')}
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.purpose}</td>
                  <td style={{ padding: '10px 14px' }}>{req.department}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(req.estimatedCosts.total)}</td>
                  <td style={{ padding: '10px 14px' }}><ApprovalStatus status={req.status} size="sm" /></td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(req.status === 'draft' || req.status === 'pending') && (
                        <button
                          type="button"
                          onClick={() => handleEdit(req)}
                          style={{ padding: '3px 10px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                      )}
                      {req.status !== 'cancelled' && req.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleCancel(req.id)}
                          style={{ padding: '3px 10px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: COLORS.danger, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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

export default TravelRequestPage;
