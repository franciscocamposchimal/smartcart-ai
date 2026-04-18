import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Plus, Save, Store, Wallet } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { carts, activeCart, loading, fetchCarts, createCart, removeItem, saveCart, setBudget } = useCart();
  const [showSaved, setShowSaved] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);

  useEffect(() => {
    fetchCarts();
  }, []);

  // Sync budget input when cart loads
  useEffect(() => {
    if (activeCart?.budget != null) {
      setBudgetInput(String(activeCart.budget));
    } else {
      setBudgetInput('');
    }
  }, [activeCart?.id, activeCart?.budget]);

  const handleSaveCart = async () => {
    if (!activeCart) return;
    if (activeCart.items?.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    await saveCart(activeCart.id);
  };

  const handleSetBudget = async () => {
    if (!activeCart) return;
    const value = parseFloat(budgetInput);
    if (isNaN(value) || value < 0) {
      toast.error('Ingresa un presupuesto válido');
      return;
    }
    await setBudget(activeCart.id, value);
    setEditingBudget(false);
    toast.success('Presupuesto actualizado');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const budget = activeCart?.budget != null ? Number(activeCart.budget) : null;
  const total = activeCart ? Number(activeCart.total) : 0;
  const budgetPercent = budget != null && budget > 0 ? Math.min((total / budget) * 100, 100) : null;
  const overBudget = budget != null && total > budget;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mi Carrito</h1>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="text-sm text-primary-600 font-medium"
        >
          {showSaved ? 'Ver activo' : 'Ver guardados'}
        </button>
      </div>

      {!showSaved ? (
        <>
          {!activeCart ? (
            <div className="card text-center py-10">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">No tienes un carrito activo</p>
              <button onClick={() => createCart()} className="btn-primary">
                <Plus size={16} className="inline mr-1" />
                Nuevo carrito
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Cart header */}
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-primary-600" />
                    <span className="font-semibold">Carrito activo</span>
                  </div>
                  {activeCart.store && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Store size={14} />
                      {activeCart.store.name}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${Number(activeCart.total).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {activeCart.items?.length || 0} productos
                </p>

                {/* Budget section */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Wallet size={14} />
                      Presupuesto
                    </span>
                    <button
                      onClick={() => setEditingBudget(!editingBudget)}
                      className="text-xs text-primary-600 font-medium hover:underline"
                    >
                      {budget != null ? 'Cambiar' : 'Establecer'}
                    </button>
                  </div>

                  {editingBudget ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        className="input flex-1 py-1.5 text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                      <button onClick={handleSetBudget} className="btn-primary px-3 py-1.5 text-sm">
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingBudget(false)}
                        className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  ) : budget != null ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={overBudget ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                          {overBudget ? '⚠ Excediste el presupuesto' : `Restante: $${(budget - total).toFixed(2)}`}
                        </span>
                        <span className="text-gray-500">${budget.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${overBudget ? 'bg-red-500' : (budgetPercent ?? 0) > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${budgetPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Sin presupuesto establecido</p>
                  )}
                </div>
              </div>

              {/* Items */}
              {activeCart.items?.map((item) => (
                <div key={item.id} className="card flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${Number(item.subtotal).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(activeCart.id, item.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {activeCart.items?.length === 0 && (
                <div className="card text-center py-6 text-gray-400">
                  Agrega productos con el escáner
                </div>
              )}

              {/* Save button */}
              {activeCart.items?.length > 0 && (
                <button
                  onClick={handleSaveCart}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar carrito (${Number(activeCart.total).toFixed(2)})
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="font-semibold text-gray-700">Carritos guardados</h2>
          {carts.filter((c) => c.status !== 'open').length === 0 ? (
            <div className="card text-center py-10 text-gray-400">
              No tienes carritos guardados aún
            </div>
          ) : (
            carts
              .filter((c) => c.status !== 'open')
              .map((cart) => (
                <div key={cart.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {cart.store?.name || 'Tienda desconocida'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(cart.createdAt).toLocaleDateString('es-MX')} ·{' '}
                        {cart.items?.length || 0} productos
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ${Number(cart.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
          )}
        </>
      )}
    </div>
  );
}
