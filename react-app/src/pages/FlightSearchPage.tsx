import React, { useState, useMemo } from 'react';
import { useFlights } from '../hooks/useFlights';
import { useNotifications } from '../context/NotificationContext';
import DatePicker from '../components/DatePicker';
import { formatCurrency, formatDuration, formatDate } from '../utils/format';
import type { Flight, CabinClass, TripType, FlightSearchParams } from '../types';

const COLORS = {
  primary: '#1a237e',
  accent: '#2196f3',
  success: '#4caf50',
  warning: '#ff9800',
  danger: '#f44336',
  bg: '#f5f7fa',
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

const btnPrimary: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: COLORS.primary,
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

type SortKey = 'price' | 'duration' | 'departure';

const FlightSearchPage: React.FC = () => {
  const { flights, loading, error, searchFlights, bookFlight } = useFlights();
  const { addNotification } = useNotifications();

  // Search form
  const [tripType, setTripType] = useState<TripType>('round_trip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>('economy');

  // Filters
  const [maxPrice, setMaxPrice] = useState(5000);
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [depTimeStart, setDepTimeStart] = useState('00:00');
  const [depTimeEnd, setDepTimeEnd] = useState('23:59');
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Detail / selection
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedFlight(null);
    const params: FlightSearchParams = {
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'round_trip' ? returnDate : undefined,
      passengers,
      cabinClass,
      tripType,
    };
    await searchFlights(params);
    setSearched(true);
  };

  const handleBook = async () => {
    if (!selectedFlight) return;
    try {
      await bookFlight(selectedFlight.id, { passengers, cabinClass });
      addNotification('Flight booked successfully!', 'success');
      setSelectedFlight(null);
    } catch {
      addNotification('Failed to book flight.', 'error');
    }
  };

  // Apply client-side filters & sort
  const filtered = useMemo(() => {
    let list = [...flights];
    list = list.filter((f) => f.price <= maxPrice);
    if (maxStops !== null) list = list.filter((f) => f.stops <= maxStops);
    // departure time filter
    list = list.filter((f) => {
      if (f.segments.length === 0) return true;
      const depHour = new Date(f.segments[0].departureTime).getHours();
      const depMin = new Date(f.segments[0].departureTime).getMinutes();
      const depStr = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;
      return depStr >= depTimeStart && depStr <= depTimeEnd;
    });
    // sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'price') cmp = a.price - b.price;
      else if (sortBy === 'duration') cmp = a.totalDuration - b.totalDuration;
      else if (sortBy === 'departure') {
        const aT = a.segments[0]?.departureTime ?? '';
        const bT = b.segments[0]?.departureTime ?? '';
        cmp = aT.localeCompare(bT);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [flights, maxPrice, maxStops, depTimeStart, depTimeEnd, sortBy, sortDir]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 24, color: COLORS.primary }}>✈️ Flight Search</h1>

      {/* Trip type toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['round_trip', 'one_way'] as TripType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            style={{
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 600,
              border: `2px solid ${tripType === t ? COLORS.accent : '#ccc'}`,
              borderRadius: 20,
              background: tripType === t ? COLORS.accent : '#fff',
              color: tripType === t ? '#fff' : '#555',
              cursor: 'pointer',
            }}
          >
            {t === 'round_trip' ? 'Round Trip' : 'One Way'}
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ background: COLORS.card, borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>Origin</label>
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} required placeholder="e.g. JFK" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Destination</label>
            <input value={destination} onChange={(e) => setDestination(e.target.value)} required placeholder="e.g. LAX" style={inputStyle} />
          </div>
          <div>
            <DatePicker label="Depart" value={departureDate} onChange={setDepartureDate} min={today} required />
          </div>
          {tripType === 'round_trip' && (
            <div>
              <DatePicker label="Return" value={returnDate} onChange={setReturnDate} min={departureDate || today} required />
            </div>
          )}
          <div>
            <label style={labelStyle}>Passengers</label>
            <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} style={inputStyle}>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cabin</label>
            <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)} style={inputStyle}>
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Searching…' : 'Search Flights'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ background: '#ffebee', color: COLORS.danger, padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {searched && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
          {/* Filters sidebar */}
          <div style={{ background: COLORS.card, borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', alignSelf: 'start' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: COLORS.primary }}>Filters</h3>

            <label style={labelStyle}>Max Price: {formatCurrency(maxPrice)}</label>
            <input
              type="range"
              min={0}
              max={10000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', marginBottom: 16 }}
            />

            <label style={labelStyle}>Stops</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {([
                { label: 'Any', value: null },
                { label: 'Non-stop', value: 0 },
                { label: '1 stop', value: 1 },
                { label: '2+', value: 2 },
              ] as const).map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setMaxStops(opt.value)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 12,
                    border: `1px solid ${maxStops === opt.value ? COLORS.accent : '#ccc'}`,
                    borderRadius: 4,
                    background: maxStops === opt.value ? COLORS.accent : '#fff',
                    color: maxStops === opt.value ? '#fff' : '#555',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label style={labelStyle}>Departure Window</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type="time" value={depTimeStart} onChange={(e) => setDepTimeStart(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <input type="time" value={depTimeEnd} onChange={(e) => setDepTimeEnd(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            </div>

            <label style={labelStyle}>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} style={{ ...inputStyle, marginBottom: 8 }}>
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="departure">Departure</option>
            </select>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')} style={inputStyle}>
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
            </select>
          </div>

          {/* Results */}
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#666' }}>
              {filtered.length} flight{filtered.length !== 1 ? 's' : ''} found
            </p>

            {loading && <p style={{ color: '#888' }}>Loading…</p>}

            {!loading && filtered.length === 0 && (
              <div style={{ background: COLORS.card, borderRadius: 10, padding: 32, textAlign: 'center', color: '#888' }}>
                <p style={{ fontSize: 40, margin: '0 0 8px' }}>🔍</p>
                <p>No flights match your criteria. Try adjusting your filters.</p>
              </div>
            )}

            {filtered.map((flight) => {
              const dep = flight.segments[0];
              const arr = flight.segments[flight.segments.length - 1];
              const isSelected = selectedFlight?.id === flight.id;
              return (
                <div
                  key={flight.id}
                  onClick={() => setSelectedFlight(isSelected ? null : flight)}
                  style={{
                    background: COLORS.card,
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: isSelected ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'border 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, marginBottom: 4 }}>
                        {flight.airline} — {flight.segments.map((s) => s.flightNumber).join(', ')}
                      </div>
                      <div style={{ fontSize: 13, color: '#555' }}>
                        {dep && formatDate(dep.departureTime, 'time')} {dep?.departureAirport.code}
                        {' → '}
                        {arr && formatDate(arr.arrivalTime, 'time')} {arr?.arrivalAirport.code}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 100 }}>
                      <div style={{ fontSize: 13, color: '#888' }}>{formatDuration(flight.totalDuration)}</div>
                      <div style={{ fontSize: 12, color: flight.stops === 0 ? COLORS.success : COLORS.warning }}>
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 100 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(flight.price)}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{flight.cabinClass.replace('_', ' ')}</div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isSelected && (
                    <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#888' }}>Baggage</div>
                          <div style={{ fontSize: 13 }}>{flight.baggageAllowance ?? 'Standard'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#888' }}>Refundable</div>
                          <div style={{ fontSize: 13 }}>{flight.refundable ? 'Yes' : 'No'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#888' }}>Seats Left</div>
                          <div style={{ fontSize: 13, color: flight.seatsAvailable < 5 ? COLORS.danger : COLORS.success }}>
                            {flight.seatsAvailable}
                          </div>
                        </div>
                      </div>

                      {flight.segments.map((seg) => (
                        <div key={seg.segmentId} style={{ background: '#f9f9f9', padding: 10, borderRadius: 6, marginBottom: 8, fontSize: 13 }}>
                          <strong>{seg.flightNumber}</strong> — {seg.departureAirport.code} → {seg.arrivalAirport.code}
                          <br />
                          {formatDate(seg.departureTime, 'datetime')} → {formatDate(seg.arrivalTime, 'datetime')} · {formatDuration(seg.duration)}
                          {seg.aircraft && <span style={{ color: '#888' }}> · {seg.aircraft}</span>}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleBook(); }}
                        disabled={loading}
                        style={{
                          ...btnPrimary,
                          background: COLORS.success,
                          marginTop: 8,
                          width: '100%',
                        }}
                      >
                        {loading ? 'Booking…' : `Book for ${formatCurrency(flight.price * passengers)}`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearchPage;
