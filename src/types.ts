export interface MenuItem {
  id: string;
  name: string;
  price: number; // in standard currency (e.g. 215, which translates to some value or Rupees/USD/etc. Let's assume standard formatting like $2.15 or ₹215. Let's make it look elegant, e.g. "₹215" or "$215" depending on locale. Since 215 looks like standard currency, let's display it as a direct price like $2.15 or ₹215. We'll use ₹ or $ cleanly, we'll format it as a simple generic symbol or let the user choose, e.g., ₹215 or standard coffee units).
  category: string; // "hot_coffee" | "iced_coffee" | "cold_brews" | "hot_chocolate" | "tea" | "matcha"
  description: string;
  imageUrl?: string;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  tokenNumber: number;
  status: 'Received' | 'Baking' | 'Completed';
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export type CategoryKey = 'all' | 'hot_coffee' | 'iced_coffee' | 'cold_brews' | 'hot_chocolate' | 'tea' | 'matcha';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
}
