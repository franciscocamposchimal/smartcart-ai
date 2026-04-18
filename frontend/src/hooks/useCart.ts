import { useState, useCallback } from 'react';
import { api, Cart } from '../lib/api';
import toast from 'react-hot-toast';

export function useCart() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [activeCart, setActiveCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Cart[] }>('/cart');
      setCarts(res.data);
      const open = res.data.find((c) => c.status === 'open');
      if (open) setActiveCart(open);
    } catch (err: any) {
      toast.error('Error cargando carritos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCart = useCallback(async (storeId?: string) => {
    const res = await api.post<{ success: boolean; data: Cart }>('/cart', { storeId });
    setActiveCart(res.data);
    setCarts((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const addItem = useCallback(
    async (cartId: string, productId: string, unitPrice: number, quantity = 1) => {
      try {
        await api.post(`/cart/${cartId}/items`, { productId, unitPrice, quantity });
        const res = await api.get<{ success: boolean; data: Cart }>(`/cart/${cartId}`);
        setActiveCart(res.data);
        setCarts((prev) => prev.map((c) => (c.id === cartId ? res.data : c)));
        toast.success('Producto agregado');
      } catch (err: any) {
        toast.error(err.message || 'Error al agregar producto');
      }
    },
    [],
  );

  const removeItem = useCallback(async (cartId: string, itemId: string) => {
    try {
      await api.delete(`/cart/${cartId}/items/${itemId}`);
      const res = await api.get<{ success: boolean; data: Cart }>(`/cart/${cartId}`);
      setActiveCart(res.data);
      setCarts((prev) => prev.map((c) => (c.id === cartId ? res.data : c)));
    } catch (err: any) {
      toast.error('Error al eliminar producto');
    }
  }, []);

  const saveCart = useCallback(async (cartId: string) => {
    try {
      await api.patch(`/cart/${cartId}/save`);
      toast.success('Carrito guardado');
      setActiveCart(null);
      await fetchCarts();
    } catch (err: any) {
      toast.error('Error al guardar carrito');
    }
  }, [fetchCarts]);

  const setBudget = useCallback(async (cartId: string, budget: number) => {
    try {
      const res = await api.patch<{ success: boolean; data: Cart }>(`/cart/${cartId}/budget`, { budget });
      setActiveCart(res.data);
      setCarts((prev) => prev.map((c) => (c.id === cartId ? res.data : c)));
    } catch (err: any) {
      toast.error('Error al actualizar el presupuesto');
    }
  }, []);

  return {
    carts,
    activeCart,
    loading,
    fetchCarts,
    createCart,
    addItem,
    removeItem,
    saveCart,
    setBudget,
  };
}
