import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanLine, ShoppingCart, History, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/scanner', label: 'Escanear', icon: ScanLine, end: false },
  { to: '/cart', label: 'Carrito', icon: ShoppingCart, end: false },
  { to: '/history', label: 'Historial', icon: History, end: false },
  { to: '/stats', label: 'Stats', icon: BarChart3, end: false },
];

export default function Layout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          <span className="font-bold text-lg">SmartCart AI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80 hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'text-primary-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
