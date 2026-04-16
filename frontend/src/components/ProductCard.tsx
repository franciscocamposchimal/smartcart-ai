import { ShoppingCart, Tag } from 'lucide-react';
import { Product } from '../lib/api';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, price: number) => void;
}

const categoryEmojis: Record<string, string> = {
  dairy: '🥛',
  fruits: '🍎',
  vegetables: '🥦',
  meat: '🥩',
  bakery: '🍞',
  beverages: '🥤',
  snacks: '🍿',
  cleaning: '🧹',
  personal_care: '🧴',
  other: '📦',
};

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const emoji = categoryEmojis[product.category || 'other'] || '📦';

  return (
    <div className="card flex items-start gap-3">
      <div className="text-3xl">{emoji}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        {product.brand && (
          <p className="text-sm text-gray-500">{product.brand}</p>
        )}
        {product.category && (
          <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full mt-1">
            <Tag size={10} />
            {product.category}
          </span>
        )}
        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        )}
        {product.barcode && (
          <p className="text-xs text-gray-400 mt-1">Código: {product.barcode}</p>
        )}
      </div>
      {onAddToCart && (
        <button
          onClick={() => onAddToCart(product, 0)}
          className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex-shrink-0"
          title="Agregar al carrito"
        >
          <ShoppingCart size={18} />
        </button>
      )}
    </div>
  );
}
