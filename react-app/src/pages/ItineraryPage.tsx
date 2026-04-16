import React, { useEffect, useState } from 'react';
import { useItinerary } from '../hooks/useItinerary';
import { useNotifications } from '../context/NotificationContext';
import ApprovalStatus from '../components/ApprovalStatus';
import { formatCurrency, formatDate, formatTime } from '../utils/format';
import type { Trip, ItineraryItem } from '../types';

const COLORS = {
  primary: '#1a237e',
  accent: '#2196f3',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#f44336',
  card: '#fff',
};

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled';

const typeEmoji: Record<string, string> = {
  flight: '✈️',
  hotel: '🏨',
  car_rental: '🚗',
  activity: '🎯',
  transfer: '🚐',
  note: '📝',
};

const ItineraryPage: React.FC = () => {
  const { trips, selectedTrip, loading, error, loadTrips, selectTrip, addNote, cancelItem } = useItinerary();
  const { addNotification } = useNotifications();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [noteItemId, setNoteItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleSelectTrip = (trip: Trip) => {
    selectTrip(trip.id);
  };

  const handleAddNote = async (itemId: string) => {
    if (!noteText.trim()) return;
    try {
      await addNote(itemId, noteText.trim());
      addNotification('Note added', 'success');
      setNoteItemId(null);
      setNoteText('');
    } catch {
      addNotification('Failed to add note', 'error');
    }
  };

  const handleCancel = async (item: ItineraryItem) => {
    if (!window.confirm(`Cancel "${item.title}"?`)) return;
    try {
      await cancelItem(item.id);
      addNotification('Item cancelled', 'success');
    } catch {
      addNotification('Failed to cancel item', 'error');
    }
  };

  const filteredDayGroups = selectedTrip?.dayGroups.map((dg) => ({
    ...dg,
    items: dg.items.filter((it) => statusFilter === 'all' || it.status === statusFilter),
  })).filter((dg) => dg.items.length > 0);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 24, color: COLORS.primary }}>📋 Itinerary</h1>

      {error && (
        <div style={{ background: '#ffebee', color: COLORS.danger, padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Trip selector */}
        <div style={{ background: COLORS.card, borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', alignSelf: 'start' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: COLORS.primary }}>My Trips</h3>
          {loading && trips.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>Loading…</p>}
          {!loading && trips.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>No trips found.</p>}
          {trips.map((trip) => {
            const isActive = selectedTrip?.id === trip.id;
            return (
              <div
                key={trip.id}
                onClick={() => handleSelectTrip(trip)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: isActive ? '#e3f2fd' : '#f9f9f9',
                  border: isActive ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>{trip.title}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {trip.destination} · {formatDate(trip.startDate, 'short')} – {formatDate(trip.endDate, 'short')}
                </div>
                <div style={{ marginTop: 4 }}>
                  <ApprovalStatus status={trip.status} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trip detail */}
        <div>
          {!selectedTrip && !loading && (
            <div style={{ background: COLORS.card, borderRadius: 10, padding: 40, textAlign: 'center', color: '#888', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 40, margin: '0 0 8px' }}>📋</p>
              <p>Select a trip to view its itinerary.</p>
            </div>
          )}

          {loading && selectedTrip === null && <p style={{ color: '#888' }}>Loading trip…</p>}

          {selectedTrip && (
            <>
              {/* Trip summary */}
              <div style={{ background: COLORS.card, borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: 20, color: COLORS.primary }}>{selectedTrip.title}</h2>
                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                      {selectedTrip.destination} · {formatDate(selectedTrip.startDate)} – {formatDate(selectedTrip.endDate)}
                    </p>
                  </div>
                  <ApprovalStatus status={selectedTrip.status} size="lg" />
                </div>

                {/* Cost breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginTop: 16 }}>
                  {(Object.entries(selectedTrip.totals) as [string, number | string][])
                    .filter(([key]) => key !== 'currency' && key !== 'grandTotal')
                    .filter(([, val]) => typeof val === 'number' && val > 0)
                    .map(([key, val]) => (
                      <div key={key} style={{ background: '#f5f7fa', padding: '8px 12px', borderRadius: 6, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#888', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.primary }}>{formatCurrency(val as number)}</div>
                      </div>
                    ))}
                  <div style={{ background: COLORS.primary, padding: '8px 12px', borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Total</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{formatCurrency(selectedTrip.totals.grandTotal)}</div>
                  </div>
                </div>
              </div>

              {/* Status filter */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {(['all', 'confirmed', 'pending', 'cancelled'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '5px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1px solid ${statusFilter === s ? COLORS.accent : '#ccc'}`,
                      borderRadius: 20,
                      background: statusFilter === s ? COLORS.accent : '#fff',
                      color: statusFilter === s ? '#fff' : '#555',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Day groups */}
              {(!filteredDayGroups || filteredDayGroups.length === 0) && (
                <div style={{ background: COLORS.card, borderRadius: 10, padding: 24, textAlign: 'center', color: '#888' }}>
                  No items match the current filter.
                </div>
              )}

              {filteredDayGroups?.map((dg) => (
                <div key={dg.date} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 15, color: COLORS.primary }}>{dg.dayLabel}</h3>
                    <span style={{ fontSize: 13, color: '#888' }}>{formatCurrency(dg.dailyTotal)}</span>
                  </div>

                  {dg.items.map((item) => (
                    <div key={item.id} style={{ background: COLORS.card, borderRadius: 8, padding: 14, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${item.status === 'cancelled' ? COLORS.danger : item.status === 'pending' ? COLORS.warning : COLORS.success}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {typeEmoji[item.type] ?? '•'} {item.title}
                          </div>
                          {item.description && <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{item.description}</div>}
                          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                            {item.startTime && <span>{formatTime(item.startTime)}</span>}
                            {item.endTime && <span> – {formatTime(item.endTime)}</span>}
                            {item.location && <span> · {item.location}</span>}
                            {item.confirmationNumber && <span> · Ref: {item.confirmationNumber}</span>}
                          </div>
                          {item.notes && (
                            <div style={{ marginTop: 6, fontSize: 12, color: '#555', background: '#fff8e1', padding: '4px 8px', borderRadius: 4 }}>
                              📝 {item.notes}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary }}>{formatCurrency(item.cost)}</div>
                          <ApprovalStatus status={item.status} size="sm" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        {item.status !== 'cancelled' && (
                          <>
                            <button
                              type="button"
                              onClick={() => { setNoteItemId(noteItemId === item.id ? null : item.id); setNoteText(item.notes ?? ''); }}
                              style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
                            >
                              {noteItemId === item.id ? 'Cancel' : 'Add Note'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(item)}
                              style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: COLORS.danger, cursor: 'pointer' }}
                            >
                              Cancel Item
                            </button>
                          </>
                        )}
                      </div>

                      {/* Note input */}
                      {noteItemId === item.id && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <input
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter note…"
                            style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid #ccc', borderRadius: 4, outline: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddNote(item.id)}
                            style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;
