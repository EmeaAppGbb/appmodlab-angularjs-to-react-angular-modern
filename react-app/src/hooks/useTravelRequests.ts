import { useState, useCallback } from 'react';
import apiClient from '../utils/api';
import type {
  TravelRequest,
  ApiResponse,
  ApiListResponse,
} from '../types';

interface SubmitTravelRequestData {
  destination: string;
  departureDate: string;
  returnDate: string;
  purpose: string;
  department: string;
  projectCode?: string;
  estimatedCosts: {
    flights: number;
    hotels: number;
    meals: number;
    transportation: number;
    other: number;
    total: number;
    currency: string;
  };
}

interface UpdateTravelRequestData {
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  purpose?: string;
  estimatedCosts?: Partial<SubmitTravelRequestData['estimatedCosts']>;
}

interface UseTravelRequestsReturn {
  requests: TravelRequest[];
  loading: boolean;
  error: string | null;
  loadRequests: () => Promise<void>;
  submitRequest: (data: SubmitTravelRequestData) => Promise<TravelRequest>;
  updateRequest: (id: string, data: UpdateTravelRequestData) => Promise<TravelRequest>;
  cancelRequest: (id: string) => Promise<TravelRequest>;
}

export function useTravelRequests(): UseTravelRequestsReturn {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiListResponse<TravelRequest>>('/travel-requests');
      setRequests(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load travel requests';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRequest = useCallback(
    async (data: SubmitTravelRequestData): Promise<TravelRequest> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiResponse<TravelRequest>>(
          '/travel-requests',
          data,
        );
        const newRequest = response.data;
        setRequests((prev) => [newRequest, ...prev]);
        return newRequest;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit travel request';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateRequest = useCallback(
    async (id: string, data: UpdateTravelRequestData): Promise<TravelRequest> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.put<ApiResponse<TravelRequest>>(
          `/travel-requests/${id}`,
          data,
        );
        const updated = response.data;
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? updated : req)),
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update travel request';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cancelRequest = useCallback(async (id: string): Promise<TravelRequest> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<ApiResponse<TravelRequest>>(
        `/travel-requests/${id}/cancel`,
        {},
      );
      const cancelled = response.data;
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? cancelled : req)),
      );
      return cancelled;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel travel request';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { requests, loading, error, loadRequests, submitRequest, updateRequest, cancelRequest };
}

export default useTravelRequests;
