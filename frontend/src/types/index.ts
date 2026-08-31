export type BusinessType = 'RESTAURANT' | 'CAFE' | 'BAKERY' | 'RETAIL';
export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN_STAFF' | 'INVENTORY_STAFF';

export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  KITCHEN_STAFF: 'KITCHEN_STAFF',
  INVENTORY_STAFF: 'INVENTORY_STAFF'
} as const;

export type SubscriptionPlan = 'FREE_TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  companyId?: string;
  businessName: string;
  businessType: BusinessType;
  subscriptionPlan: SubscriptionPlan;
  currency: string;
  logo?: string;
  address?: string;
  gstin?: string;
  taxRateDefault?: number;
  invoicePrefix?: string;
}

export interface ProductModifier {
  name: string;
  price: number;
}

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  categoryId?: { _id: string; name: string } | string;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  currentStock: number;
  minimumStock: number;
  isService: boolean;
  productImage?: string;
  modifiers?: ProductModifier[];
  activeStatus: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  colorCode?: string;
}

export interface Customer {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  loyaltyPoints: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedModifiers: ProductModifier[];
  unitPrice: number;
  taxRate: number;
  itemTotal: number;
}

export interface InvoicePaymentDetail {
  method: 'CASH' | 'UPI' | 'CARD' | 'POINTS';
  amount: number;
  transactionRef?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentDetails: InvoicePaymentDetail[];
  isRefunded: boolean;
  issuedAt: string;
}

export interface RestaurantTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export interface KOTTicket {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  items: {
    productName: string;
    quantity: number;
    selectedModifiers?: ProductModifier[];
    specialInstructions?: string;
  }[];
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  createdAt: string;
}

export interface CustomCakeOrder {
  _id: string;
  customerName: string;
  customerPhone: string;
  deliveryDateTime: string;
  cakeFlavour: string;
  cakeWeightKg: number;
  customMessage?: string;
  customInstructions?: string;
  totalPrice: number;
  advancePaid: number;
  remainingBalance: number;
  status: 'RECEIVED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
}

export interface StockMovement {
  _id: string;
  productId: { _id: string; name: string; sku: string };
  type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'WASTE';
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface Employee {
  _id: string;
  employeeId?: string;
  userId?: { _id: string; name: string; email: string; phoneNumber?: string };
  invitedEmail?: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'INVITED';
}

export interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
}

