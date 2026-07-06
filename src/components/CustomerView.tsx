import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Check, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Coffee,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MenuItem, CartItem, Order, CategoryKey } from '../types';
import { CATEGORIES } from '../initialMenu';
import { placeOrder, subscribeToOrder } from '../dbService';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerViewProps {
  menuItems: MenuItem[];
  tableNumber: string;
  onOpenAdminPin: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ menuItems, tableNumber, onOpenAdminPin }) => {
  // Navigation & filtering state
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Placed Order state for live tracking
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Live order listener
  useEffect(() => {
    if (!activeOrder) return;
    
    // Subscribe to active order updates
    const unsubscribe = subscribeToOrder(activeOrder.id, (updatedOrder) => {
      if (updatedOrder) {
        setActiveOrder(updatedOrder);
      }
    });

    return () => unsubscribe();
  }, [activeOrder?.id]);

  // Calculate cart metrics
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prevCart.map((ci) => 
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prevCart.map((ci) => 
          ci.menuItem.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
        );
      }
      return prevCart.filter((ci) => ci.menuItem.id !== itemId);
    });
  };

  const getItemQuantity = (itemId: string): number => {
    const item = cart.find((ci) => ci.menuItem.id === itemId);
    return item ? item.quantity : 0;
  };

  // Checkout submission
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const placed = await placeOrder(tableNumber || '4', cart, totalAmount);
      setActiveOrder(placed);
      setCart([]); // Clear cart
      setIsCartOpen(false); // Close cart sheet
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-[#FEF6F6] min-h-screen text-[#080504] font-sans pb-32">
      {/* Hero Header Section */}
      <div className="text-center pt-8 pb-6 px-4 bg-gradient-to-b from-[#ECD8D6]/30 to-transparent">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECD8D6] text-[#B13818] text-xs font-semibold tracking-wider uppercase mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EST. 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#B13818] tracking-tight">
          Greg's Cafe
        </h1>
        <p className="text-xs tracking-[0.2em] font-sans font-medium text-[#675A58] uppercase mt-1">
          SWEET MOMENTS ARE HERE
        </p>
        
        {tableNumber && (
          <div className="mt-2.5 inline-block text-xs bg-[#FDB2B2]/50 text-[#B13818] font-bold px-3 py-1 rounded-full border border-[#D97C7A]/20">
            Table Number: {tableNumber}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Dynamic Live Order Tracking Banner */}
        {activeOrder && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-[#080504] text-[#FEF6F6] p-5 rounded-2xl shadow-xl border border-[#D97C7A]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D97C7A]/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs text-[#FDB2B2] font-semibold uppercase tracking-wider">Live Active Order</span>
                <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                  Token #{activeOrder.tokenNumber} — Table {activeOrder.tableNumber}
                </h3>
              </div>
              <button 
                onClick={() => setActiveOrder(null)} 
                className="text-[#675A58] hover:text-[#FEF6F6] p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Dismiss status banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Status Bar */}
            <div className="mt-4 grid grid-cols-3 gap-2 relative">
              <div className="absolute top-4 left-[16.6%] right-[16.6%] h-0.5 bg-[#675A58]/50 z-0" />
              
              {/* Step 1: Received */}
              <div className="flex flex-col items-center z-10 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                  activeOrder.status === 'Received' || activeOrder.status === 'Baking' || activeOrder.status === 'Completed'
                    ? 'bg-[#D97C7A] text-[#080504] border-[#D97C7A] scale-110 shadow-[0_0_10px_rgba(217,124,122,0.4)]'
                    : 'bg-[#080504] text-[#675A58] border-[#675A58]'
                }`}>
                  {activeOrder.status === 'Baking' || activeOrder.status === 'Completed' ? <Check className="w-4 h-4 stroke-[3px]" /> : '1'}
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                  activeOrder.status === 'Received' ? 'text-[#FDB2B2]' : 'text-[#675A58]'
                }`}>Received</span>
              </div>

              {/* Step 2: Baking */}
              <div className="flex flex-col items-center z-10 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                  activeOrder.status === 'Baking' || activeOrder.status === 'Completed'
                    ? 'bg-[#D97C7A] text-[#080504] border-[#D97C7A] scale-110 shadow-[0_0_10px_rgba(217,124,122,0.4)]'
                    : 'bg-[#080504] text-[#675A58] border-[#675A58]'
                }`}>
                  {activeOrder.status === 'Completed' ? <Check className="w-4 h-4 stroke-[3px]" /> : '2'}
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                  activeOrder.status === 'Baking' ? 'text-[#FDB2B2] animate-pulse' : 'text-[#675A58]'
                }`}>Baking</span>
              </div>

              {/* Step 3: Completed */}
              <div className="flex flex-col items-center z-10 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                  activeOrder.status === 'Completed'
                    ? 'bg-[#D97C7A] text-[#080504] border-[#D97C7A] scale-110 shadow-[0_0_10px_rgba(217,124,122,0.4)]'
                    : 'bg-[#080504] text-[#675A58] border-[#675A58]'
                }`}>
                  3
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                  activeOrder.status === 'Completed' ? 'text-green-400 font-bold' : 'text-[#675A58]'
                }`}>Ready!</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#675A58]/30 flex justify-between items-center text-xs text-[#675A58]">
              <div className="flex items-center gap-1 text-[#FDB2B2]">
                <Clock className="w-3.5 h-3.5" />
                <span>Live status synced via Firebase</span>
              </div>
              <div>
                {activeOrder.status === 'Received' && 'Chef is reviewing your order...'}
                {activeOrder.status === 'Baking' && 'Chef is preparing your delicacies!'}
                {activeOrder.status === 'Completed' && 'Pickup your order from the counter!'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Bar Section */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#675A58]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search delicacies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#ECD8D6]/40 text-[#080504] rounded-2xl border border-[#ECD8D6] focus:border-[#D97C7A] focus:outline-none focus:ring-1 focus:ring-[#D97C7A] placeholder-[#675A58]/60 transition-all text-sm font-medium shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-[#675A58] hover:text-[#080504]"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontally Touch-Scrollable Category Row */}
        <div className="relative mb-6 overflow-hidden">
          <div className="overflow-x-auto scrollbar-none flex gap-2 pb-2 -mx-4 px-4 mask-gradient">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.key;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key as CategoryKey)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#D97C7A] text-[#FEF6F6] shadow-sm'
                      : 'bg-[#ECD8D6]/60 text-[#675A58] hover:bg-[#ECD8D6] hover:text-[#080504]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <motion.div
                  layoutId={`item-${item.id}`}
                  key={item.id}
                  className="bg-[#ECD8D6]/30 hover:bg-[#ECD8D6]/50 transition-colors p-4 rounded-2xl flex gap-4 items-center border border-[#ECD8D6]/40 shadow-sm relative overflow-hidden"
                >
                  {/* Rounded Image on one side */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60'}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className={`w-20 h-20 rounded-2xl object-cover shadow-sm bg-[#ECD8D6] transition-opacity duration-300 ${
                        !item.available ? 'opacity-40 filter grayscale' : ''
                      }`}
                    />
                    {!item.available && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider bg-black/60 text-[#FEF6F6] rounded-2xl">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-grow min-w-0 pr-4">
                    <h3 className="font-serif font-bold text-base text-[#080504] truncate leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#675A58] line-clamp-2 mt-0.5 leading-relaxed font-sans">
                      {item.description}
                    </p>
                    <div className="text-sm font-bold text-[#B13818] mt-1.5 flex items-center gap-1 font-serif">
                      <span>₹{item.price}</span>
                    </div>
                  </div>

                  {/* Add / Quantity Button Controls */}
                  <div className="flex-shrink-0 z-10">
                    {qty > 0 ? (
                      <div className="flex items-center gap-1 bg-[#D97C7A] text-[#FEF6F6] px-1.5 py-1 rounded-full shadow-sm">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                          title="Remove one"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{qty}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                          title="Add one"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.available}
                        className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-sm transition-all ${
                          item.available
                            ? 'bg-[#FDB2B2] text-[#080504] hover:bg-[#D97C7A] hover:text-[#FEF6F6] active:scale-95'
                            : 'bg-[#675A58]/20 text-[#675A58]/50 cursor-not-allowed'
                        }`}
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4 bg-[#ECD8D6]/10 rounded-2xl border border-dashed border-[#ECD8D6]/40">
              <AlertCircle className="w-8 h-8 text-[#675A58] mx-auto mb-2" />
              <p className="text-sm text-[#675A58] font-medium">No delicacies match your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Sticky Cart Button */}
      {totalItemsCount > 0 && (
        <motion.button
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-[#080504] text-[#FEF6F6] p-4 rounded-full shadow-2xl flex items-center gap-3 z-40 border border-[#D97C7A]/40 group"
          title="Open cart drawer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#FDB2B2]" />
            <span className="absolute -top-2.5 -right-2.5 bg-[#D97C7A] text-[#FEF6F6] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse border border-[#080504]">
              {totalItemsCount}
            </span>
          </div>
          <span className="text-xs font-bold font-sans pr-1">Review Cart • ₹{totalAmount}</span>
        </motion.button>
      )}

      {/* Bottom Sheet Cart Drawer Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#FEF6F6] rounded-t-[2.5rem] shadow-2xl border-t border-[#ECD8D6] z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-[#ECD8D6]/60 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#B13818]">Your Delicacies</h3>
                  <p className="text-xs text-[#675A58]">Table {tableNumber || '4'} • Review your checkout items</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#ECD8D6]/50 hover:bg-[#ECD8D6] text-[#080504] p-1.5 rounded-full transition-colors"
                  title="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="flex justify-between items-center border-b border-[#ECD8D6]/20 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-12 h-12 rounded-xl object-cover bg-[#ECD8D6]"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#080504]">{item.menuItem.name}</h4>
                        <p className="text-xs text-[#B13818] font-serif font-semibold">₹{item.menuItem.price} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-[#ECD8D6]/60 p-1 rounded-full border border-[#ECD8D6]">
                        <button
                          onClick={() => removeFromCart(item.menuItem.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#D97C7A] hover:text-[#FEF6F6] transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center text-xs font-bold text-[#080504]">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.menuItem)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#D97C7A] hover:text-[#FEF6F6] transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold font-serif text-[#080504] w-14 text-right">
                        ₹{item.menuItem.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary Footer */}
              <div className="p-6 bg-[#ECD8D6]/30 border-t border-[#ECD8D6] space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#675A58] font-medium">Subtotal Amount</span>
                  <span className="font-bold text-[#080504] font-serif">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#675A58] font-medium">Service Tax & CGST (Inclusive)</span>
                  <span className="font-bold text-[#080504]">₹0</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#ECD8D6]/50 pt-3">
                  <span className="text-base font-serif font-bold text-[#B13818]">Grand Total</span>
                  <span className="text-xl font-serif font-bold text-[#B13818]">₹{totalAmount}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cart.length === 0}
                  className="w-full bg-[#080504] text-[#FEF6F6] hover:bg-[#D97C7A] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed group"
                >
                  {isPlacingOrder ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Place Order (Token Bound)</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Subtle Footer inside CustomerView */}
      <footer className="max-w-3xl mx-auto px-4 mt-16 pb-8 border-t border-[#ECD8D6]/45 pt-8 text-center">
        <p className="text-xs text-[#675A58] font-serif italic">
          Greg's Cafe • Fresh Brews & Delightful Savories
        </p>
        <p className="text-[10px] text-[#675A58]/50 mt-1 font-mono tracking-wider">
          EST. 2026 • ALL RIGHTS RESERVED
        </p>
        <button
          onClick={onOpenAdminPin}
          className="mt-4 inline-flex items-center gap-1 text-[10px] text-[#675A58]/60 hover:text-[#B13818] transition-colors font-mono tracking-widest uppercase hover:underline cursor-pointer"
        >
          <span>Staff Dashboard Access</span>
        </button>
      </footer>
    </div>
  );
};
