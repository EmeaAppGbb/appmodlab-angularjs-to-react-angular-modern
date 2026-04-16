import React, { useState, useMemo } from 'react';
import { useHotels } from '../hooks/useHotels';
import { useNotifications } from '../context/NotificationContext';
import DatePicker from '../components/DatePicker';
import { formatCurrency } from '../utils/format';
import type { Hotel, HotelRoom, Amenity } from '../types';

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

const ALL_AMENITIES: Amenity[] = [
  'wifi', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'parking',
  'airport_shuttle', 'business_center', 'breakfast_included', 'pet_friendly',
];

const amenityEmoji: Record<string, string> = {
  wifi: '📶', pool: '🏊', gym: '🏋️', spa: '💆', restaurant: '🍽️',
  bar: '🍸', parking: '🅿️', airport_shuttle: '🚐', business_center: '💼',
  breakfast_included: '🥐', pet_friendly: '🐾', laundry: '👔',
  room_service: '🛎️', air_conditioning: '❄️', ev_charging: '⚡',
};

type SortKey = 'recommended' | 'price' | 'rating';

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

const HotelBookingPage: React.FC = () => {
  const { hotels, loading, error, searchHotels, getHotelRooms, bookRoom } = useHotels();
  const { addNotification } = useNotifications();

  // Search
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [searched, setSearched] = useState(false);

  // Filters
  const [sortKey, setSortKey] = useState<SortKey>('recommended');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [amenityFilters, setAmenityFilters] = useState<Set<Amenity>>(new Set());

  // Selection
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedHotel(null);
    setSelectedRoom(null);
    setHotelRooms([]);
    await searchHotels({ city, checkIn, checkOut, guests, rooms });
    setSearched(true);
  };

  const handleSelectHotel = async (hotel: Hotel) => {
    if (selectedHotel?.id === hotel.id) {
      setSelectedHotel(null);
      setHotelRooms([]);
      setSelectedRoom(null);
      return;
    }
    setSelectedHotel(hotel);
    setSelectedRoom(null);
    setLoadingRooms(true);
    try {
      const r = await getHotelRooms(hotel.id, { checkIn, checkOut });
      setHotelRooms(r);
    } catch {
      setHotelRooms(hotel.rooms ?? []);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleBook = async () => {
    if (!selectedHotel || !selectedRoom) return;
    try {
      await bookRoom({ hotelId: selectedHotel.id, roomId: selectedRoom.id, checkIn, checkOut, guests });
      addNotification('Hotel booked successfully!', 'success');
      setSelectedHotel(null);
      setSelectedRoom(null);
    } catch {
      addNotification('Failed to book hotel.', 'error');
    }
  };

  const toggleAmenity = (a: Amenity) => {
    setAmenityFilters((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a); else next.add(a);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = [...hotels];
    list = list.filter((h) => h.starRating >= minRating);
    list = list.filter((h) => {
      const cheapest = h.rooms.length > 0 ? Math.min(...h.rooms.map((r) => r.pricePerNight)) : 0;
      return cheapest <= maxPrice;
    });
    if (amenityFilters.size > 0) {
      list = list.filter((h) => [...amenityFilters].every((a) => h.amenities.includes(a)));
    }
    list.sort((a, b) => {
      if (sortKey === 'price') {
        const ap = a.rooms.length ? Math.min(...a.rooms.map((r) => r.pricePerNight)) : 0;
        const bp = b.rooms.length ? Math.min(...b.rooms.map((r) => r.pricePerNight)) : 0;
        return ap - bp;
      }
      if (sortKey === 'rating') return b.guestRating - a.guestRating;
      return 0;
    });
    return list;
  }, [hotels, minRating, maxPrice, amenityFilters, sortKey]);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 24, color: COLORS.primary }}>🏨 Hotel Booking</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ background: COLORS.card, borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="e.g. New York" style={inputStyle} />
          </div>
          <div>
            <DatePicker label="Check-in" value={checkIn} onChange={setCheckIn} min={today} required />
          </div>
          <div>
            <DatePicker label="Check-out" value={checkOut} onChange={setCheckOut} min={checkIn || today} required />
          </div>
          <div>
            <label style={labelStyle}>Guests</label>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} style={inputStyle}>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Rooms</label>
            <select value={rooms} onChange={(e) => setRooms(Number(e.target.value))} style={inputStyle}>
              {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        {nights > 0 && (
          <p style={{ margin: '12px 0 0', fontSize: 14, color: COLORS.accent, fontWeight: 600 }}>
            {nights} night{nights !== 1 ? 's' : ''}
          </p>
        )}
        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: loading ? '#999' : COLORS.primary, border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Searching…' : 'Search Hotels'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ background: '#ffebee', color: COLORS.danger, padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>{error}</div>
      )}

      {searched && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
          {/* Filters */}
          <div style={{ background: COLORS.card, borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', alignSelf: 'start' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: COLORS.primary }}>Filters</h3>

            <label style={labelStyle}>Sort By</label>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} style={{ ...inputStyle, marginBottom: 16 }}>
              <option value="recommended">Recommended</option>
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rating</option>
            </select>

            <label style={labelStyle}>Min Star Rating: {minRating || 'Any'}</label>
            <input type="range" min={0} max={5} step={1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} style={{ width: '100%', marginBottom: 16 }} />

            <label style={labelStyle}>Max Price/Night: {formatCurrency(maxPrice)}</label>
            <input type="range" min={0} max={2000} step={25} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: '100%', marginBottom: 16 }} />

            <label style={labelStyle}>Amenities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    border: `1px solid ${amenityFilters.has(a) ? COLORS.accent : '#ccc'}`,
                    borderRadius: 4,
                    background: amenityFilters.has(a) ? COLORS.accent : '#fff',
                    color: amenityFilters.has(a) ? '#fff' : '#555',
                    cursor: 'pointer',
                  }}
                >
                  {amenityEmoji[a] ?? ''} {a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#666' }}>
              {filtered.length} hotel{filtered.length !== 1 ? 's' : ''} found
            </p>

            {!loading && filtered.length === 0 && (
              <div style={{ background: COLORS.card, borderRadius: 10, padding: 32, textAlign: 'center', color: '#888' }}>
                <p style={{ fontSize: 40, margin: '0 0 8px' }}>🔍</p>
                <p>No hotels match your criteria.</p>
              </div>
            )}

            {filtered.map((hotel) => {
              const cheapest = hotel.rooms.length ? Math.min(...hotel.rooms.map((r) => r.pricePerNight)) : 0;
              const isSelected = selectedHotel?.id === hotel.id;
              return (
                <div
                  key={hotel.id}
                  style={{
                    background: COLORS.card,
                    borderRadius: 10,
                    marginBottom: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: isSelected ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    onClick={() => handleSelectHotel(hotel)}
                    style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.primary, marginBottom: 4 }}>{hotel.name}</div>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{hotel.address}, {hotel.city}</div>
                      <div style={{ fontSize: 16, color: '#f9a825', marginBottom: 6 }}>{renderStars(hotel.starRating)}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {hotel.amenities.slice(0, 6).map((a) => (
                          <span key={a} style={{ fontSize: 11, background: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: 3 }}>
                            {amenityEmoji[a] ?? ''} {a.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {hotel.amenities.length > 6 && (
                          <span style={{ fontSize: 11, color: '#888' }}>+{hotel.amenities.length - 6} more</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: '#888' }}>from</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(cheapest)}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>per night</div>
                      <div style={{ marginTop: 6, background: COLORS.accent, color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>
                        {hotel.guestRating.toFixed(1)}/10 ({hotel.reviewCount})
                      </div>
                    </div>
                  </div>

                  {/* Room selection */}
                  {isSelected && (
                    <div style={{ borderTop: '1px solid #eee', padding: 16, background: '#fafafa' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: 15, color: COLORS.primary }}>Select a Room</h4>
                      {loadingRooms && <p style={{ color: '#888', fontSize: 13 }}>Loading rooms…</p>}
                      {!loadingRooms && hotelRooms.length === 0 && (
                        <p style={{ color: '#888', fontSize: 13 }}>No rooms available for these dates.</p>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                        {hotelRooms.filter((r) => r.available).map((room) => {
                          const isRoomSelected = selectedRoom?.id === room.id;
                          return (
                            <div
                              key={room.id}
                              onClick={() => setSelectedRoom(isRoomSelected ? null : room)}
                              style={{
                                padding: 14,
                                borderRadius: 8,
                                border: isRoomSelected ? `2px solid ${COLORS.success}` : '1px solid #ddd',
                                background: '#fff',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{room.name}</div>
                              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{room.bedType} · Up to {room.maxGuests} guests</div>
                              <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.primary }}>{formatCurrency(room.pricePerNight)}<span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/night</span></div>
                              {nights > 0 && (
                                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                  Total: {formatCurrency(room.pricePerNight * nights)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Booking summary */}
                      {selectedRoom && (
                        <div style={{ marginTop: 16, padding: 16, background: '#e8f5e9', borderRadius: 8 }}>
                          <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#1b5e20' }}>Booking Summary</h4>
                          <div style={{ fontSize: 13, marginBottom: 4 }}><strong>{hotel.name}</strong> — {selectedRoom.name}</div>
                          <div style={{ fontSize: 13, marginBottom: 4 }}>{checkIn} → {checkOut} · {nights} night{nights !== 1 ? 's' : ''} · {guests} guest{guests !== 1 ? 's' : ''}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary, margin: '8px 0' }}>
                            {formatCurrency(selectedRoom.pricePerNight * nights)}
                          </div>
                          <button
                            type="button"
                            onClick={handleBook}
                            disabled={loading}
                            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: loading ? '#999' : COLORS.success, border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}
                          >
                            {loading ? 'Booking…' : 'Book Now'}
                          </button>
                        </div>
                      )}
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

export default HotelBookingPage;
