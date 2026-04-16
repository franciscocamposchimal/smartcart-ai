import { useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Brain } from 'lucide-react';
import { useStats } from '../hooks/useStats';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff'];

export default function StatsPage() {
  const {
    spending,
    priceAlerts,
    recurring,
    storeRankings,
    aiInsights,
    loading,
    fetchAllStats,
    fetchAiInsights,
  } = useStats();

  useEffect(() => {
    fetchAllStats();
  }, []);

  const storeChartData = Object.entries(spending?.byStore || {}).map(([name, value]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    value,
  }));

  const storeRankingData = storeRankings.map((s) => ({
    name: s.store?.name || 'Desconocida',
    visits: s.visits,
    total: Number(s.totalSpent).toFixed(2),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Estadísticas</h1>
        <button onClick={fetchAllStats} className="p-2 text-gray-500 hover:text-gray-700">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Summary */}
      {spending && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-sm text-gray-500">Gasto del mes</p>
            <p className="text-2xl font-bold text-primary-600">
              ${spending.total.toFixed(2)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500">Compras</p>
            <p className="text-2xl font-bold text-gray-900">{spending.count}</p>
          </div>
        </div>
      )}

      {/* Spending by store pie chart */}
      {storeChartData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">Gasto por tienda</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={storeChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {storeChartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `$${Number(v).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Store rankings bar chart */}
      {storeRankingData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">Visitas por tienda</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={storeRankingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="visits" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Price alerts */}
      {priceAlerts.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">Variaciones de precio</h2>
          <div className="space-y-2">
            {priceAlerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{alert.product?.name}</p>
                  <p className="text-xs text-gray-500">
                    ${alert.previousPrice} → ${alert.latestPrice}
                  </p>
                </div>
                <div className={`flex items-center gap-1 font-semibold text-sm ${
                  alert.isIncrease ? 'text-red-500' : 'text-green-500'
                }`}>
                  {alert.isIncrease ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(alert.changePercent)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recurring products */}
      {recurring.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">Compras frecuentes</h2>
          <div className="space-y-2">
            {recurring.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm text-gray-700">{item.product?.name}</p>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  ×{item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Brain size={18} className="text-primary-600" />
            Insights de IA
          </h2>
          <button
            onClick={fetchAiInsights}
            className="text-sm text-primary-600 font-medium"
          >
            Analizar
          </button>
        </div>
        {aiInsights ? (
          <p className="text-sm text-gray-700 whitespace-pre-line">{aiInsights}</p>
        ) : (
          <p className="text-sm text-gray-400">
            Presiona "Analizar" para obtener recomendaciones personalizadas de Gemini AI
          </p>
        )}
      </div>
    </div>
  );
}
