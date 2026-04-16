import { useEffect, useState } from 'react';
import { Receipt as ReceiptIcon, Upload, Plus } from 'lucide-react';
import { api, Receipt } from '../lib/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [total, setTotal] = useState('');

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Receipt[] }>('/receipts');
      setReceipts(res.data);
    } catch {
      toast.error('Error cargando historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        await api.post('/receipts', {
          total: parseFloat(total) || 0,
          imageBase64: base64,
        });
        toast.success('Ticket guardado y analizado con IA');
        setShowUpload(false);
        fetchReceipts();
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error('Error al guardar ticket');
    } finally {
      setUploadLoading(false);
    }
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
        <h1 className="text-xl font-bold text-gray-900">Historial de Compras</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn-primary flex items-center gap-1 py-1.5 text-sm"
        >
          <Plus size={16} />
          Ticket
        </button>
      </div>

      {/* Upload receipt */}
      {showUpload && (
        <div className="card space-y-3 border-2 border-dashed border-primary-200">
          <h3 className="font-semibold flex items-center gap-2">
            <Upload size={16} />
            Subir ticket de compra
          </h3>
          <p className="text-sm text-gray-500">
            La IA extraerá automáticamente todos los productos del ticket
          </p>
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="input"
            placeholder="Total del ticket (opcional)"
            step="0.01"
          />
          <label className="btn-primary flex items-center justify-center gap-2 cursor-pointer">
            {uploadLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Procesando con IA...
              </>
            ) : (
              <>
                <Upload size={18} />
                Seleccionar foto
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleUploadReceipt}
            />
          </label>
        </div>
      )}

      {receipts.length === 0 ? (
        <div className="card text-center py-10">
          <ReceiptIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No hay tickets guardados aún</p>
          <p className="text-sm text-gray-400 mt-1">
            Guarda un carrito o sube una foto de tu ticket
          </p>
        </div>
      ) : (
        receipts.map((receipt) => (
          <div key={receipt.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">
                  {receipt.store?.name || 'Tienda desconocida'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(receipt.purchaseDate).toLocaleDateString('es-MX', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className="text-xl font-bold text-gray-900">
                ${Number(receipt.total).toFixed(2)}
              </span>
            </div>

            {receipt.extractedItems && receipt.extractedItems.length > 0 && (
              <div className="mt-2 border-t border-gray-100 pt-2">
                <p className="text-xs text-gray-400 mb-1">
                  {receipt.extractedItems.length} productos extraídos por IA:
                </p>
                <div className="space-y-0.5">
                  {receipt.extractedItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate">{item.name}</span>
                      <span className="text-gray-500 ml-2 flex-shrink-0">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {receipt.extractedItems.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{receipt.extractedItems.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
