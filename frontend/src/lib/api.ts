const BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    return data;
  }

  get<T>(path: string) {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

export const api = new ApiClient();

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  description?: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  userId: string;
  storeId?: string;
  store?: Store;
  status: 'open' | 'saved' | 'completed';
  name?: string;
  total: number;
  items: CartItem[];
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  location?: string;
  logoUrl?: string;
}

export interface Receipt {
  id: string;
  userId: string;
  cartId?: string;
  storeId?: string;
  store?: Store;
  total: number;
  imageUrl?: string;
  extractedItems?: Array<{ name: string; price: number; quantity?: number }>;
  purchaseDate: string;
  createdAt: string;
}
