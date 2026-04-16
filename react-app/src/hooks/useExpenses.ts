import { useState, useCallback } from 'react';
import apiClient from '../utils/api';
import type {
  ExpenseReport,
  ExpenseDashboard,
  ApiResponse,
  ApiListResponse,
} from '../types';

interface SubmitExpenseReportData {
  title: string;
  tripDestination: string;
  tripId?: string;
  travelRequestId?: string;
  items: {
    date: string;
    category: string;
    description: string;
    amount: number;
    currency: string;
    vendor?: string;
    notes?: string;
  }[];
}

interface UseExpensesReturn {
  reports: ExpenseReport[];
  loading: boolean;
  error: string | null;
  dashboard: ExpenseDashboard | null;
  loadReports: () => Promise<void>;
  submitReport: (data: SubmitExpenseReportData) => Promise<ExpenseReport>;
  deleteReport: (id: string) => Promise<void>;
  uploadReceipt: (expenseId: string, file: File) => Promise<string>;
}

export function useExpenses(): UseExpensesReturn {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<ExpenseDashboard | null>(null);

  const loadReports = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [reportsResponse, dashboardResponse] = await Promise.all([
        apiClient.get<ApiListResponse<ExpenseReport>>('/expense-reports'),
        apiClient.get<ApiResponse<ExpenseDashboard>>('/expense-reports/dashboard'),
      ]);
      setReports(reportsResponse.data);
      setDashboard(dashboardResponse.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load expense reports';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = useCallback(
    async (data: SubmitExpenseReportData): Promise<ExpenseReport> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiResponse<ExpenseReport>>(
          '/expense-reports',
          data,
        );
        const newReport = response.data;
        setReports((prev) => [newReport, ...prev]);
        return newReport;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit expense report';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteReport = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete<ApiResponse<void>>(`/expense-reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete expense report';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadReceipt = useCallback(
    async (expenseId: string, file: File): Promise<string> => {
      setError(null);
      try {
        const formData = new FormData();
        formData.append('receipt', file);

        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `http://localhost:3000/api/expenses/${expenseId}/receipt`,
          {
            method: 'POST',
            headers,
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const result = (await response.json()) as ApiResponse<{ receiptUrl: string }>;
        return result.data.receiptUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload receipt';
        setError(message);
        throw err;
      }
    },
    [],
  );

  return { reports, loading, error, dashboard, loadReports, submitReport, deleteReport, uploadReceipt };
}

export default useExpenses;
