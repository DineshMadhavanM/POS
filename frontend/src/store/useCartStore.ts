import { create } from 'zustand';
import { Product, ProductModifier, Customer, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  selectedCustomer: Customer | null;
  selectedTableId: string | null;
  selectedTableNumber: string | null;
  orderType: 'RETAIL_SALE' | 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'BAKERY_ORDER';
  discountAmount: number;
  discountPercentage: number;
  notes: string;

  addItem: (product: Product, selectedModifiers?: ProductModifier[]) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  setCustomer: (customer: Customer | null) => void;
  setTable: (tableId: string | null, tableNumber: string | null) => void;
  setOrderType: (type: any) => void;
  setDiscountAmount: (amt: number) => void;
  setDiscountPercentage: (pct: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  
  getSubtotal: () => number;
  getTaxTotal: () => number;
  getDiscountTotal: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedCustomer: null,
  selectedTableId: null,
  selectedTableNumber: null,
  orderType: 'RETAIL_SALE',
  discountAmount: 0,
  discountPercentage: 0,
  notes: '',

  addItem: (product, selectedModifiers = []) => {
    set((state) => {
      const modifierSum = selectedModifiers.reduce((acc, m) => acc + m.price, 0);
      const unitPrice = product.sellingPrice + modifierSum;
      const existingIndex = state.items.findIndex((item) => item.product._id === product._id);

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        const item = updatedItems[existingIndex];
        const newQty = item.quantity + 1;
        updatedItems[existingIndex] = {
          ...item,
          quantity: newQty,
          itemTotal: newQty * unitPrice
        };
        return { items: updatedItems };
      } else {
        const newItem: CartItem = {
          product,
          quantity: 1,
          selectedModifiers,
          unitPrice,
          taxRate: product.taxRate || 0,
          itemTotal: unitPrice
        };
        return { items: [...state.items, newItem] };
      }
    });
  },

  updateQuantity: (productId, delta) => {
    set((state) => {
      const updatedItems = state.items
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.unitPrice
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return { items: updatedItems };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product._id !== productId)
    }));
  },

  setCustomer: (customer) => set({ selectedCustomer: customer }),
  setTable: (tableId, tableNumber) => set({ selectedTableId: tableId, selectedTableNumber: tableNumber }),
  setOrderType: (type) => set({ orderType: type }),
  setDiscountAmount: (amt) => set({ discountAmount: amt, discountPercentage: 0 }),
  setDiscountPercentage: (pct) => set({ discountPercentage: pct, discountAmount: 0 }),
  setNotes: (notes) => set({ notes }),

  clearCart: () => set({
    items: [],
    selectedCustomer: null,
    selectedTableId: null,
    selectedTableNumber: null,
    discountAmount: 0,
    discountPercentage: 0,
    notes: ''
  }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.itemTotal, 0);
  },

  getTaxTotal: () => {
    return get().items.reduce((sum, item) => {
      const tax = (item.itemTotal * item.taxRate) / 100;
      return sum + tax;
    }, 0);
  },

  getDiscountTotal: () => {
    const subtotal = get().getSubtotal();
    const { discountAmount, discountPercentage } = get();
    if (discountPercentage > 0) {
      return (subtotal * discountPercentage) / 100;
    }
    return Math.min(discountAmount, subtotal);
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = get().getTaxTotal();
    const discount = get().getDiscountTotal();
    return Math.max(0, subtotal + tax - discount);
  }
}));
