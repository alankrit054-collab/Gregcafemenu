export interface CustomizationOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number; // in standard currency
  category: string; // "hot_coffee" | "iced_coffee" | "cold_brews" | "hot_chocolate" | "tea" | "matcha"
  description: string;
  imageUrl?: string;
  available: boolean;
  dietType?: 'VEG' | 'NON-VEG';
  isBestseller?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  milkOptions?: CustomizationOption[];
  addOnsOptions?: CustomizationOption[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customization?: {
    milk?: string;
    addOns?: string[];
    addedPrice: number;
  };
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizationDescription?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  tokenNumber: number;
  status: 'pending_approval' | 'received' | 'baking' | 'completed' | 'rejected' | 'Received' | 'Baking' | 'Completed' | 'archived' | 'delivered' | 'Archived' | 'Delivered';
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  specialInstructions?: string;
}

export type CategoryKey = 'all' | 'hot_coffee' | 'iced_coffee' | 'cold_brews' | 'hot_chocolate' | 'tea' | 'matcha';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
}
