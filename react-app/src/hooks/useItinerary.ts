import { useState, useCallback } from 'react';
import apiClient from '../utils/api';
import type {
  Trip,
  ItineraryItem,
  ApiResponse,
  ApiListResponse,
} from '../types';

interface UseItineraryReturn {
  trips: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;
  loadTrips: () => Promise<void>;
  selectTrip: (tripId: string) => Promise<void>;
  addNote: (itemId: string, text: string) => Promise<ItineraryItem>;
  cancelItem: (itemId: string) => Promise<ItineraryItem>;
}

export function useItinerary(): UseItineraryReturn {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiListResponse<Trip>>('/trips');
      setTrips(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trips';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectTrip = useCallback(async (tripId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<Trip>>(`/trips/${tripId}`);
      setSelectedTrip(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trip';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = useCallback(
    async (itemId: string, text: string): Promise<ItineraryItem> => {
      setError(null);
      try {
        const response = await apiClient.put<ApiResponse<ItineraryItem>>(
          `/itinerary-items/${itemId}/notes`,
          { notes: text },
        );
        const updatedItem = response.data;

        // Update the item within the selected trip
        setSelectedTrip((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((item) => (item.id === itemId ? updatedItem : item)),
          };
        });

        return updatedItem;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add note';
        setError(message);
        throw err;
      }
    },
    [],
  );

  const cancelItem = useCallback(async (itemId: string): Promise<ItineraryItem> => {
    setError(null);
    try {
      const response = await apiClient.put<ApiResponse<ItineraryItem>>(
        `/itinerary-items/${itemId}/cancel`,
        {},
      );
      const cancelledItem = response.data;

      setSelectedTrip((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === itemId ? cancelledItem : item)),
        };
      });

      return cancelledItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel item';
      setError(message);
      throw err;
    }
  }, []);

  return { trips, selectedTrip, loading, error, loadTrips, selectTrip, addNote, cancelItem };
}

export default useItinerary;
