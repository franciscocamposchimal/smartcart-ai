import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, ShoppingCart, History, BarChart3, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStats } from '../hooks/useStats';

const quickActions = [
  { to: '/scanner', icon: ScanLine, label: 'Escanear', color: 'bg-blue-50 text-blue-600' },
  { to: '/cart', icon: ShoppingCart, label: 'Mi Carrito', color: 'bg-green-50 text-green-600' },
  { to: '/history', icon: History, label: 'Historial', color: 'bg-purple-50 text-purple-600' },
  { to: '/stats', icon: BarChart3, label: 'Estadísticas', color: 'bg-orange-50 text-orange-600' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { spending, priceAlerts, fetchAllStats } = useStats();

  useEffect(() => {
    fetchAllStats();
  }, []);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm">Aquí está tu resumen de compras</p>
      </div>

      {/* Monthly spending card */}
      {spending && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Gasto este mes</p>
          <p className="text-3xl font-bold mt-1">
            ${spending.total.toFixed(2)}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {spending.count} compras registradas
          </p>
        </div>
      )}

      {/* Price alerts */}
      {priceAlerts.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-orange-500" />
            <h2 className="font-semibold">Alertas de precio</h2>
          </div>
          <div className="space-y-2">
            {priceAlerts.slice(0, 3).map((alert, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{alert.product?.name}</span>
                <span
                  className={`text-sm font-medium ${
                    alert.isIncrease ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {alert.isIncrease ? '↑' : '↓'} {Math.abs(alert.changePercent)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="card flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={22} />
              </div>
              <span className="font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
