import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface SpendingData {
  total: number;
  count: number;
  byStore: Record<string, number>;
  receipts: any[];
}

export function useStats() {
  const [spending, setSpending] = useState<SpendingData | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);
  const [recurring, setRecurring] = useState<any[]>([]);
  const [storeRankings, setStoreRankings] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSpending = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await api.get<{ success: boolean; data: SpendingData }>(
        `/stats/spending?${params}`,
      );
      setSpending(res.data);
    } catch (err: any) {
      toast.error('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    try {
      const [spendRes, alertsRes, recurringRes, storesRes] = await Promise.all([
        api.get<{ success: boolean; data: SpendingData }>('/stats/spending'),
        api.get<{ success: boolean; data: any[] }>('/stats/price-alerts'),
        api.get<{ success: boolean; data: any[] }>('/stats/recurring'),
        api.get<{ success: boolean; data: any[] }>('/stats/stores'),
      ]);
      setSpending(spendRes.data);
      setPriceAlerts(alertsRes.data);
      setRecurring(recurringRes.data);
      setStoreRankings(storesRes.data);
    } catch (err: any) {
      toast.error('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAiInsights = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: string }>('/stats/ai-insights');
      setAiInsights(res.data);
    } catch {
      toast.error('Error obteniendo insights de IA');
    }
  }, []);

  return {
    spending,
    priceAlerts,
    recurring,
    storeRankings,
    aiInsights,
    loading,
    fetchSpending,
    fetchAllStats,
    fetchAiInsights,
  };
}
