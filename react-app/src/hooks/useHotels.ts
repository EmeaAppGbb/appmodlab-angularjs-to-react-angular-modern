import { useState, useCallback } from 'react';
import apiClient from '../utils/api';
import type {
  Hotel,
  HotelRoom,
  HotelSearchParams,
  Booking,
  ApiResponse,
  ApiListResponse,
  ISODateString,
} from '../types';

interface BookRoomData {
  hotelId: string;
  roomId: string;
  checkIn: ISODateString;
  checkOut: ISODateString;
  guests: number;
  notes?: string;
}

interface UseHotelsReturn {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  searchHotels: (params: HotelSearchParams) => Promise<void>;
  getHotelRooms: (hotelId: string, dates: { checkIn: ISODateString; checkOut: ISODateString }) => Promise<HotelRoom[]>;
  bookRoom: (data: BookRoomData) => Promise<Booking>;
}

export function useHotels(): UseHotelsReturn {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = useCallback(async (params: HotelSearchParams): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const response = await apiClient.get<ApiListResponse<Hotel>>(
        `/hotels?${query.toString()}`,
      );
      setHotels(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search hotels';
      setError(message);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHotelRooms = useCallback(
    async (
      hotelId: string,
      dates: { checkIn: ISODateString; checkOut: ISODateString },
    ): Promise<HotelRoom[]> => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
        });
        const response = await apiClient.get<ApiResponse<HotelRoom[]>>(
          `/hotels/${hotelId}/rooms?${query.toString()}`,
        );
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load hotel rooms';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const bookRoom = useCallback(async (data: BookRoomData): Promise<Booking> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ApiResponse<Booking>>(
        `/hotels/${data.hotelId}/rooms/${data.roomId}/book`,
        data,
      );
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book room';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { hotels, loading, error, searchHotels, getHotelRooms, bookRoom };
}

export default useHotels;
