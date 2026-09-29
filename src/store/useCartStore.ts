import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Define generic product interface instead of prisma generated one
export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  images: any[];
}

export interface CartItem {
  product: any; // Using any for now to include images/category relations
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }

          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => 
            item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + (price * item.quantity);
        }, 0);
      },

      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'aura-craft-cart',
    }
  )
);
