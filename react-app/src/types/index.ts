// =============================================================================
// GlobalTravel Corp — Travel Portal Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Common / Shared
// -----------------------------------------------------------------------------

/** ISO-8601 date string (e.g. "2025-07-15") */
export type ISODateString = string;

/** ISO-8601 datetime string (e.g. "2025-07-15T14:30:00Z") */
export type ISODateTimeString = string;

/** Currency amount in the smallest displayable unit (e.g. 149.99) */
export type Currency = number;

export type SortDirection = 'asc' | 'desc';

/** Pagination metadata returned by list endpoints */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Standard paginated request parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

/** Envelope for a single-resource API response */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: ISODateTimeString;
}

/** Envelope for a paginated list API response */
export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
  timestamp: ISODateTimeString;
}

/** Structure returned when an API call fails */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp: ISODateTimeString;
}

// -----------------------------------------------------------------------------
// Authentication
// -----------------------------------------------------------------------------

export type UserRole = 'employee' | 'manager' | 'admin' | 'travel_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  employeeId: string;
  phone?: string;
  avatar?: string;
  managerId?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// -----------------------------------------------------------------------------
// Flights
// -----------------------------------------------------------------------------

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type TripType = 'one_way' | 'round_trip' | 'multi_city';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  segmentId: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: ISODateTimeString;
  arrivalTime: ISODateTimeString;
  duration: number; // minutes
  aircraft?: string;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  totalDuration: number; // minutes
  stops: number;
  cabinClass: CabinClass;
  price: Currency;
  currency: string;
  seatsAvailable: number;
  airline: string;
  airlineLogo?: string;
  baggageAllowance?: string;
  refundable: boolean;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: ISODateString;
  returnDate?: ISODateString;
  passengers: number;
  cabinClass: CabinClass;
  tripType: TripType;
}

export interface FlightFilters {
  maxPrice?: Currency;
  minPrice?: Currency;
  airlines?: string[];
  maxStops?: number;
  departureTimeRange?: { start: string; end: string };
  arrivalTimeRange?: { start: string; end: string };
  refundableOnly?: boolean;
  maxDuration?: number; // minutes
  sortBy?: 'price' | 'duration' | 'departure' | 'arrival';
  sortDirection?: SortDirection;
}

export interface Booking {
  id: string;
  userId: string;
  type: 'flight' | 'hotel';
  status: BookingStatus;
  flight?: Flight;
  hotel?: Hotel;
  room?: HotelRoom;
  totalCost: Currency;
  currency: string;
  passengers?: number;
  guests?: number;
  confirmationNumber?: string;
  bookedAt: ISODateTimeString;
  cancellationDeadline?: ISODateTimeString;
  notes?: string;
}

// -----------------------------------------------------------------------------
// Hotels
// -----------------------------------------------------------------------------

export type HotelRating = 1 | 2 | 3 | 4 | 5;

export type Amenity =
  | 'wifi'
  | 'pool'
  | 'gym'
  | 'spa'
  | 'restaurant'
  | 'bar'
  | 'parking'
  | 'airport_shuttle'
  | 'business_center'
  | 'laundry'
  | 'room_service'
  | 'pet_friendly'
  | 'breakfast_included'
  | 'air_conditioning'
  | 'ev_charging';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  starRating: HotelRating;
  guestRating: number; // 0 – 10
  reviewCount: number;
  amenities: Amenity[];
  images: string[];
  rooms: HotelRoom[];
  checkInTime: string;  // "15:00"
  checkOutTime: string; // "11:00"
  cancellationPolicy?: string;
}

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'executive' | 'presidential';

export interface HotelRoom {
  id: string;
  hotelId: string;
  type: RoomType;
  name: string;
  description: string;
  pricePerNight: Currency;
  currency: string;
  maxGuests: number;
  bedType: string;
  squareFootage?: number;
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface HotelSearchParams {
  city: string;
  checkIn: ISODateString;
  checkOut: ISODateString;
  guests: number;
  rooms: number;
}

export interface HotelFilters {
  maxPricePerNight?: Currency;
  minPricePerNight?: Currency;
  starRating?: HotelRating[];
  minGuestRating?: number;
  amenities?: Amenity[];
  roomTypes?: RoomType[];
  freeCancellation?: boolean;
  sortBy?: 'price' | 'rating' | 'distance' | 'guest_rating';
  sortDirection?: SortDirection;
}

// -----------------------------------------------------------------------------
// Itinerary
// -----------------------------------------------------------------------------

export type ItineraryItemType = 'flight' | 'hotel' | 'car_rental' | 'activity' | 'transfer' | 'note';
export type TripStatus = 'planning' | 'booked' | 'in_progress' | 'completed' | 'cancelled';

export interface ItineraryItem {
  id: string;
  tripId: string;
  type: ItineraryItemType;
  title: string;
  description?: string;
  date: ISODateString;
  startTime?: string;
  endTime?: string;
  location?: string;
  confirmationNumber?: string;
  cost: Currency;
  currency: string;
  bookingId?: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

/** Items grouped by calendar day for the itinerary view */
export interface DayGroup {
  date: ISODateString;
  dayLabel: string; // e.g. "Day 1 — Mon, Jul 15"
  items: ItineraryItem[];
  dailyTotal: Currency;
}

export interface ItineraryTotals {
  flights: Currency;
  hotels: Currency;
  carRentals: Currency;
  activities: Currency;
  transfers: Currency;
  other: Currency;
  grandTotal: Currency;
  currency: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: ISODateString;
  endDate: ISODateString;
  status: TripStatus;
  items: ItineraryItem[];
  dayGroups: DayGroup[];
  totals: ItineraryTotals;
  travelRequestId?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

// -----------------------------------------------------------------------------
// Travel Requests
// -----------------------------------------------------------------------------

export type TravelRequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface EstimatedCosts {
  flights: Currency;
  hotels: Currency;
  meals: Currency;
  transportation: Currency;
  other: Currency;
  total: Currency;
  currency: string;
}

export interface TravelRequest {
  id: string;
  userId: string;
  destination: string;
  departureDate: ISODateString;
  returnDate: ISODateString;
  purpose: string;
  department: string;
  projectCode?: string;
  estimatedCosts: EstimatedCosts;
  status: TravelRequestStatus;
  approverId?: string;
  approverName?: string;
  approverComments?: string;
  approvedAt?: ISODateTimeString;
  rejectedAt?: ISODateTimeString;
  attachments?: string[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

// -----------------------------------------------------------------------------
// Expense Reports
// -----------------------------------------------------------------------------

export type ExpenseStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'reimbursed';

export type ExpenseCategory =
  | 'airfare'
  | 'hotel'
  | 'meals'
  | 'ground_transport'
  | 'car_rental'
  | 'fuel'
  | 'parking'
  | 'tolls'
  | 'phone'
  | 'internet'
  | 'conference_fees'
  | 'supplies'
  | 'tips'
  | 'other';

export interface ExpenseItem {
  id: string;
  expenseReportId: string;
  date: ISODateString;
  category: ExpenseCategory;
  description: string;
  amount: Currency;
  currency: string;
  vendor?: string;
  receiptUrl?: string;
  receiptUploaded: boolean;
  notes?: string;
}

export interface ExpenseReport {
  id: string;
  userId: string;
  title: string;
  tripDestination: string;
  tripId?: string;
  travelRequestId?: string;
  status: ExpenseStatus;
  items: ExpenseItem[];
  totalAmount: Currency;
  currency: string;
  submittedAt?: ISODateTimeString;
  reviewerId?: string;
  reviewerName?: string;
  reviewerComments?: string;
  reviewedAt?: ISODateTimeString;
  reimbursedAt?: ISODateTimeString;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/** Aggregated data for the expense dashboard view */
export interface ExpenseDashboard {
  totalExpenses: Currency;
  pendingReimbursement: Currency;
  approvedThisMonth: Currency;
  rejectedThisMonth: Currency;
  recentReports: ExpenseReport[];
  expensesByCategory: Record<ExpenseCategory, Currency>;
  monthlyTrend: { month: string; amount: Currency }[];
  currency: string;
}

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------

export type NotificationType =
  | 'travel_request_submitted'
  | 'travel_request_approved'
  | 'travel_request_rejected'
  | 'expense_submitted'
  | 'expense_approved'
  | 'expense_rejected'
  | 'expense_reimbursed'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'trip_reminder'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  relatedEntityId?: string;
  createdAt: ISODateTimeString;
}
