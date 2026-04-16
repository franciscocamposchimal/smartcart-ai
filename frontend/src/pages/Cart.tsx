import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Plus, Save, Store } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { carts, activeCart, loading, fetchCarts, createCart, removeItem, saveCart } = useCart();
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleSaveCart = async () => {
    if (!activeCart) return;
    if (activeCart.items?.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    await saveCart(activeCart.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

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
