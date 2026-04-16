import { useState, useCallback } from 'react';
import apiClient from '../utils/api';
import type {
  Flight,
  FlightSearchParams,
  Booking,
  ApiResponse,
  ApiListResponse,
} from '../types';

interface PopularRoute {
  origin: string;
  destination: string;
  averagePrice: number;
  currency: string;
}

interface BookFlightDetails {
  passengers: number;
  cabinClass?: string;
  notes?: string;
}

interface UseFlightsReturn {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  searchFlights: (params: FlightSearchParams) => Promise<void>;
  bookFlight: (flightId: string, details: BookFlightDetails) => Promise<Booking>;
  getPopularRoutes: () => Promise<PopularRoute[]>;
}

export function useFlights(): UseFlightsReturn {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = useCallback(async (params: FlightSearchParams): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const response = await apiClient.get<ApiListResponse<Flight>>(
        `/flights?${query.toString()}`,
      );
      setFlights(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search flights';
      setError(message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const bookFlight = useCallback(
    async (flightId: string, details: BookFlightDetails): Promise<Booking> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiResponse<Booking>>(
          `/flights/${flightId}/book`,
          details,
        );
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to book flight';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getPopularRoutes = useCallback(async (): Promise<PopularRoute[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PopularRoute[]>>('/flights/popular-routes');
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load popular routes';
      setError(message);
      throw err;
    }
  }, []);

  return { flights, loading, error, searchFlights, bookFlight, getPopularRoutes };
}

export default useFlights;
