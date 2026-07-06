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
import { placeOrder, subscribeToOrder, subscribeCafeConfig } from '../dbService';
import { motion, AnimatePresence } from 'motion/react';

const getDietType = (item: MenuItem): 'VEG' | 'NON-VEG' => {
  if (item.dietType) return item.dietType;
  const nameLower = item.name.toLowerCase();
  const descLower = item.description.toLowerCase();
  if (
    nameLower.includes('chicken') || 
    nameLower.includes('bacon') || 
    nameLower.includes('egg') || 
    nameLower.includes('meat') ||
    descLower.includes('chicken') || 
    descLower.includes('bacon') || 
    descLower.includes('egg') || 
    descLower.includes('meat')
  ) {
    return 'NON-VEG';
  }
  return 'VEG';
};

interface CustomerViewProps {
  menuItems: MenuItem[];
  tableNumber: string;
  onOpenAdminPin: () => void;
  onSwitchToChef: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ menuItems, tableNumber, onOpenAdminPin, onSwitchToChef }) => {
  // Navigation & filtering state
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Placed Order state for live tracking
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isClosed, setIsClosed] = useState(false);

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

  // Live cafe configuration listener
  useEffect(() => {
    const unsubscribe = subscribeCafeConfig((config) => {
      if (config) {
        setIsClosed(config.is_closed);
      }
    });
    return () => unsubscribe();
  }, []);

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

  if (isClosed) {
    return (
      <div className="bg-[#FEF6F6] min-h-[90vh] text-[#080504] font-sans flex flex-col justify-between p-6">
        <div />

        {/* Center-aligned closed splash page card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full mx-auto bg-[#ECD8D6]/35 border border-[#ECD8D6] rounded-3xl p-8 text-center shadow-md flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#B13818]/10 border border-[#B13818]/35 flex items-center justify-center text-[#B13818] mb-6">
            <Clock className="w-8 h-8 stroke-[2px] animate-pulse" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-[#B13818] tracking-tight mb-3">
            Greg's Cafe
          </h1>

          <p className="text-sm text-[#675A58] font-medium leading-relaxed mb-2">
            Greg's Cafe is currently closed. We look forward to serving you during our operational hours!
          </p>

          <div className="w-12 h-[1px] bg-[#B13818]/30 my-4" />

          <p className="text-[10px] text-[#675A58]/70 uppercase tracking-widest font-mono">
            OPERATIONAL CLOSED STATUS
          </p>
        </motion.div>

        {/* Secret portal access point for admins and chefs */}
        <footer className="max-w-3xl mx-auto px-4 mt-16 text-center">
          <p className="text-xs text-[#675A58] font-serif italic">
            Greg's Cafe • Fresh Brews & Delightful Savories
          </p>
          <p className="text-[10px] text-[#675A58]/50 mt-1 font-mono tracking-wider">
            EST. 2026 • ALL RIGHTS RESERVED
          </p>
          <div className="mt-4 flex justify-center items-center gap-2 text-[9px] text-[#675A58]/35 font-mono tracking-wider select-none">
            <span>SYS_V4.2</span>
            <span>•</span>
            <button
              onClick={onSwitchToChef}
              className="hover:text-[#675A58]/70 transition-colors cursor-pointer"
            >
              SYS_OPS
            </button>
            <span>•</span>
            <button
              onClick={onOpenAdminPin}
              className="hover:text-[#675A58]/70 transition-colors cursor-pointer"
            >
              SYS_MGMT
            </button>
          </div>
        </footer>
      </div>
    );
  }

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
            className={`mb-6 p-5 rounded-2xl shadow-xl relative overflow-hidden border ${
              activeOrder.status === 'rejected'
                ? 'bg-red-950/20 text-[#FEF6F6] border-red-500/50'
                : activeOrder.status === 'pending_approval'
                ? 'bg-[#15100E] text-[#FEF6F6] border-amber-500/40'
                : 'bg-[#080504] text-[#FEF6F6] border-[#D97C7A]/30'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D97C7A]/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs text-[#FDB2B2] font-semibold uppercase tracking-wider">
                  {activeOrder.status === 'rejected'
                    ? 'Order Rejected'
                    : activeOrder.status === 'pending_approval'
                    ? 'Verification Pending'
                    : 'Live Active Order'}
                </span>
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

            {activeOrder.status === 'rejected' ? (
              <div className="mt-4 flex flex-col items-center justify-center py-4 bg-red-950/30 border border-red-500/20 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-400 animate-bounce mb-2" />
                <span className="text-sm font-bold text-red-400">Order declined by host</span>
                <span className="text-[11px] text-[#675A58] mt-1">Please consult with the restaurant staff or place a new order.</span>
              </div>
            ) : activeOrder.status === 'pending_approval' ? (
              <div className="mt-4 flex flex-col items-center justify-center py-4 bg-amber-950/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                  <span className="text-sm font-bold text-amber-400 animate-pulse">Waiting for host to confirm table order...</span>
                </div>
                <span className="text-[11px] text-[#675A58]">Your order will be routed to the kitchen as soon as it is approved.</span>
              </div>
            ) : (
              <>
                {/* Stepper Status Bar */}
                <div className="mt-4 grid grid-cols-3 gap-2 relative">
                  <div className="absolute top-4 left-[16.6%] right-[16.6%] h-0.5 bg-[#675A58]/50 z-0" />
                  
                  {/* Step 1: Received */}
                  <div className="flex flex-col items-center z-10 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                      activeOrder.status === 'Received' || activeOrder.status === 'received' || activeOrder.status === 'Baking' || activeOrder.status === 'baking' || activeOrder.status === 'Completed' || activeOrder.status === 'completed'
                        ? 'bg-[#D97C7A] text-[#080504] border-[#D97C7A] scale-110 shadow-[0_0_10px_rgba(217,124,122,0.4)]'
                        : 'bg-[#080504] text-[#675A58] border-[#675A58]'
                    }`}>
                      {activeOrder.status === 'Baking' || activeOrder.status === 'baking' || activeOrder.status === 'Completed' || activeOrder.status === 'completed' ? <Check className="w-4 h-4 stroke-[3px]" /> : '1'}
                    </div>
                    <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      activeOrder.status === 'Received' || activeOrder.status === 'received' ? 'text-[#FDB2B2]' : 'text-[#675A58]'
                    }`}>Received</span>
                  </div>

                  {/* Step 2: Baking */}
                  <div className="flex flex-col items-center z-10 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                      activeOrder.status === 'Baking' || activeOrder.status === 'baking' || activeOrder.status === 'Completed' || activeOrder.status === 'completed'
                        ? 'bg-[#D97C7A] text-[#080504] border-[#D97C7A] scale-110 shadow-[0_0_10px_rgba(217,124,122,0.4)]'
                        : 'bg-[#080504] text-[#675A58] border-[#675A58]'
                    }`}>
                      {activeOrder.status === 'Completed' || activeOrder.status === 'completed' ? <Check className="w-4 h-4 stroke-[3px]" /> : '2'}
                    </div>
                    <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      activeOrder.status === 'Baking' || activeOrder.status === 'baking' ? 'text-[#FDB2B2] animate-pulse' : 'text-[#675A58]'
                    }`}>Baking</span>
                  </div>

                  {/* Step 3: Completed */}
                  <div className="flex flex-col items-center z-10 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                      activeOrder.status === 'Completed' || activeOrder.status === 'completed'
                        ? 'bg-[#D97C7A] text-[#080504] border-[#D97C7A] scale-110 shadow-[0_0_10px_rgba(217,124,122,0.4)]'
                        : 'bg-[#080504] text-[#675A58] border-[#675A58]'
                    }`}>
                      3
                    </div>
                    <span className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      activeOrder.status === 'Completed' || activeOrder.status === 'completed' ? 'text-green-400 font-bold' : 'text-[#675A58]'
                    }`}>Ready!</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#675A58]/30 flex justify-between items-center text-xs text-[#675A58]">
                  <div className="flex items-center gap-1 text-[#FDB2B2]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Live status synced via Firebase</span>
                  </div>
                  <div>
                    {(activeOrder.status === 'Received' || activeOrder.status === 'received') && 'Chef is reviewing your order...'}
                    {(activeOrder.status === 'Baking' || activeOrder.status === 'baking') && 'Chef is preparing your delicacies!'}
                    {(activeOrder.status === 'Completed' || activeOrder.status === 'completed') && 'Pickup your order from the counter!'}
                  </div>
                </div>
              </>
            )}
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

                  {/* Text Details with Grayscale/Opacity for Sold Out Items */}
                  <div className={`flex-grow min-w-0 pr-4 transition-all duration-300 ${
                    !item.available ? 'opacity-45 select-none pointer-events-none filter grayscale' : ''
                  }`}>
                    {/* Diet Tag Section (Explicitly separated and using standard containers) */}
                    <div className="flex items-center gap-2 mb-1">
                      {getDietType(item) === 'VEG' ? (
                        <div className="inline-flex items-center gap-1.5" title="Vegetarian">
                          <span className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center p-0.5 rounded bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          </span>
                          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider font-mono">VEG</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5" title="Non-Vegetarian">
                          <span className="w-3.5 h-3.5 border border-amber-800 flex items-center justify-center p-0.5 rounded bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">NON-VEG</span>
                        </div>
                      )}
                    </div>

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

                  {/* Add / Quantity Button Controls or SOLD OUT Badge */}
                  <div className="flex-shrink-0 z-10">
                    {item.available ? (
                      qty > 0 ? (
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
                          className="px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-sm bg-[#FDB2B2] text-[#080504] hover:bg-[#D97C7A] hover:text-[#FEF6F6] active:scale-95 transition-all"
                        >
                          ADD
                        </button>
                      )
                    ) : (
                      <span className="px-3.5 py-2 bg-gray-200 border border-gray-300 text-gray-500 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm select-none">
                        SOLD OUT
                      </span>
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
          <span className="text-xs font-bold font-sans pr-1">Review Cart</span>
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
                  <div key={item.menuItem.id} className="flex justify-between items-center border-b border-[#ECD8D6]/20 pb-3.5 pt-1">
                    <div>
                      <h4 className="text-sm font-bold text-[#080504] font-sans">{item.menuItem.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#ECD8D6]/60 p-1 rounded-full border border-[#ECD8D6]">
                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#D97C7A] hover:text-[#FEF6F6] transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-4 text-center text-xs font-bold text-[#080504]">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item.menuItem)}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#D97C7A] hover:text-[#FEF6F6] transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary Footer */}
              <div className="p-6 bg-[#ECD8D6]/30 border-t border-[#ECD8D6]">
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
        <div className="mt-4 flex justify-center items-center gap-2 text-[9px] text-[#675A58]/35 font-mono tracking-wider select-none">
          <span>SYS_V4.2</span>
          <span>•</span>
          <button
            onClick={onSwitchToChef}
            className="hover:text-[#675A58]/70 transition-colors cursor-pointer"
          >
            SYS_OPS
          </button>
          <span>•</span>
          <button
            onClick={onOpenAdminPin}
            className="hover:text-[#675A58]/70 transition-colors cursor-pointer"
          >
            SYS_MGMT
          </button>
        </div>
      </footer>
    </div>
  );
};
