import { useState, useCallback } from 'react';
import { Search, Plus, Upload, Camera } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductCard from '../components/ProductCard';
import { api, Product } from '../lib/api';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function ScannerPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const { activeCart, createCart, addItem } = useCart();

  const lookupProduct = useCallback(async (barcode: string, imageBase64?: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: Product }>('/products/lookup', {
        barcode,
        imageBase64,
      });
      setProduct(res.data);
      toast.success(`Producto identificado: ${res.data.name}`);
    } catch (err: any) {
      toast.error('No se pudo identificar el producto');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScanned = useCallback(
    (code: string) => {
      setShowScanner(false);
      setManualBarcode(code);
      lookupProduct(code);
    },
    [lookupProduct],
  );

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      lookupProduct(manualBarcode.trim());
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const unitPrice = parseFloat(price);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    let cart = activeCart;
    if (!cart) {
      cart = await createCart();
    }

    await addItem(cart.id, product.id, unitPrice);
    setProduct(null);
    setManualBarcode('');
    setPrice('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      lookupProduct('', base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Escanear Producto</h1>

      {/* Scan actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowScanner(true)}
          className="card flex flex-col items-center gap-2 py-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-primary-200 hover:border-primary-400"
        >
          <Camera size={32} className="text-primary-600" />
          <span className="font-medium text-primary-600">Cámara</span>
          <span className="text-xs text-gray-400">Escanear código</span>
        </button>

        <label className="card flex flex-col items-center gap-2 py-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-200 hover:border-gray-400">
          <Upload size={32} className="text-gray-600" />
          <span className="font-medium text-gray-600">Foto</span>
          <span className="text-xs text-gray-400">Subir imagen</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* Manual input */}
      <form onSubmit={handleManualLookup} className="flex gap-2">
        <input
          type="text"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          className="input flex-1"
          placeholder="Ingresa código de barras..."
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-3"
        >
          <Search size={18} />
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="card flex items-center gap-3 justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          <span className="text-gray-500">Identificando producto con IA...</span>
        </div>
      )}

      {/* Product result */}
      {product && !loading && (
        <div className="space-y-3">
          <ProductCard product={product} />

          <div className="card space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Precio del producto
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <button
              onClick={handleAddToCart}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Agregar al carrito
            </button>
          </div>
        </div>
      )}

      {/* Scanner modal */}
      {showScanner && (
        <BarcodeScanner
          onScanned={handleScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
