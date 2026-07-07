import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Settings, 
  Plus, 
  Check, 
  Trash2, 
  Coffee, 
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  TrendingUp,
  Tag,
  FileText,
  Image as ImageIcon,
  ChefHat,
  X,
  Lock,
  Unlock,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { MenuItem, Order, CategoryKey } from '../types';
import { CATEGORIES } from '../initialMenu';
import { 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  updateMenuItemAvailability,
  subscribeOrders,
  subscribeCafeConfig,
  updateCafeStatus,
  updateOrderStatus,
  updateBypassApprovalGate,
  formatTokenNumber,
  fetchAllOrdersLedger,
  subscribeAllOrdersCount
} from '../dbService';
import { motion, AnimatePresence } from 'motion/react';

interface AdminViewProps {
  menuItems: MenuItem[];
  onSwitchToChef: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ menuItems, onSwitchToChef }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryKey>('all');
  const [isClosed, setIsClosed] = useState(false);
  const [bypassApprovalGate, setBypassApprovalGate] = useState(true);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<MenuItem | null>(null);

  // Form states for ADD Item
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addImageUrl, setAddImageUrl] = useState('');
  const [addCategory, setAddCategory] = useState<CategoryKey>('hot_coffee');
  const [addDescription, setAddDescription] = useState('');
  const [addDietType, setAddDietType] = useState<'VEG' | 'NON-VEG'>('VEG');
  const [addError, setAddError] = useState<string | null>(null);

  // Form states for EDIT Item
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryKey>('hot_coffee');
  const [editDescription, setEditDescription] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editDietType, setEditDietType] = useState<'VEG' | 'NON-VEG'>('VEG');
  const [editError, setEditError] = useState<string | null>(null);
  const [lifetimeOrdersCount, setLifetimeOrdersCount] = useState<number>(0);

  // Subscribe to live total count of all orders regardless of status
  useEffect(() => {
    const unsubscribe = subscribeAllOrdersCount((count) => {
      setLifetimeOrdersCount(count || 0);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to live orders stream from Firestore to compute metrics
  useEffect(() => {
    const unsubscribe = subscribeOrders((liveOrders) => {
      setOrders(liveOrders);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to live cafe status config from Firestore
  useEffect(() => {
    const unsubscribe = subscribeCafeConfig((config) => {
      if (config) {
        setIsClosed(config.is_closed);
        setBypassApprovalGate(config.bypass_approval_gate);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleCafeStatus = async () => {
    try {
      await updateCafeStatus(!isClosed);
    } catch (err) {
      console.error("Error toggling cafe status:", err);
    }
  };

  const handleToggleBypassGate = async () => {
    try {
      await updateBypassApprovalGate(!bypassApprovalGate);
    } catch (err) {
      console.error("Error toggling bypass approval gate:", err);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportLedger = async () => {
    setIsExporting(true);
    try {
      const allOrders = await fetchAllOrdersLedger();

      const ledgerRows = allOrders.flatMap((order) => {
        const dateObj = new Date(order.createdAt);
        const formattedTimestamp = isNaN(dateObj.getTime())
          ? order.createdAt
          : `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;

        const itemsListStr = order.items
          .map((item) => `${item.name} (x${item.quantity})`)
          .join('; ');

        const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return {
          'Timestamp': formattedTimestamp,
          'Token Number': formatTokenNumber(order.tokenNumber),
          'Table Number': `Table ${order.tableNumber}`,
          'Items Ordered': itemsListStr,
          'Quantity': totalQty,
          'Order Status': order.status.toUpperCase(),
          'Total Amount (₹)': order.totalAmount
        };
      });

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(ledgerRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Ledger");

      const max_widths = ledgerRows.reduce((acc, row) => {
        Object.keys(row).forEach((key) => {
          const valStr = String((row as any)[key]);
          acc[key] = Math.max(acc[key] || 0, key.length, valStr.length);
        });
        return acc;
      }, {} as Record<string, number>);

      worksheet['!cols'] = Object.keys(max_widths).map(key => ({
        wch: Math.min(Math.max(max_widths[key] + 3, 10), 60)
      }));

      XLSX.writeFile(workbook, `Gregs_Cafe_Orders_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);

    } catch (err) {
      console.error("Error exporting ledger:", err);
      alert("Failed to export ledger. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: 'received' | 'rejected') => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status.");
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Set initial form values when editing
  const handleOpenEditModal = (item: MenuItem) => {
    setSelectedItemToEdit(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditImageUrl(item.imageUrl || '');
    setEditCategory(item.category as CategoryKey);
    setEditDescription(item.description);
    setEditAvailable(item.available);
    setEditDietType(item.dietType || 'VEG');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setAddName('');
    setAddPrice('');
    setAddImageUrl('');
    setAddCategory('hot_coffee');
    setAddDescription('');
    setAddDietType('VEG');
    setAddError(null);
    setIsAddModalOpen(true);
  };

  // Create menu item submission
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      setAddError('Item Title is required.');
      return;
    }
    const parsedPrice = parseInt(addPrice, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setAddError('Please enter a valid positive numerical price.');
      return;
    }

    try {
      await addMenuItem({
        name: addName,
        price: parsedPrice,
        imageUrl: addImageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200',
        category: addCategory === 'all' ? 'hot_coffee' : addCategory,
        description: addDescription || 'Hand-crafted premium coffee delicacy.',
        dietType: addDietType
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      setAddError('Failed to add delicacy. Try again.');
    }
  };

  // Edit menu item submission
  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemToEdit) return;

    if (!editName.trim()) {
      setEditError('Item Title is required.');
      return;
    }
    const parsedPrice = parseInt(editPrice, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setEditError('Please enter a valid positive numerical price.');
      return;
    }

    try {
      await updateMenuItem({
        id: selectedItemToEdit.id,
        name: editName,
        price: parsedPrice,
        imageUrl: editImageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200',
        category: editCategory === 'all' ? 'hot_coffee' : editCategory,
        description: editDescription,
        available: editAvailable,
        dietType: editDietType
      });
      setIsEditModalOpen(false);
      setSelectedItemToEdit(null);
    } catch (err) {
      console.error(err);
      setEditError('Failed to save changes. Try again.');
    }
  };

  // Toggle quick availability
  const handleToggleQuickAvailability = async (itemId: string, currentAvailable: boolean) => {
    try {
      await updateMenuItemAvailability(itemId, !currentAvailable);
    } catch (error) {
      console.error("Error toggling item availability:", error);
    }
  };

  // Delete menu item
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this delicacy?')) {
      try {
        await deleteMenuItem(itemId);
        setIsEditModalOpen(false);
        setSelectedItemToEdit(null);
      } catch (err) {
        console.error(err);
        alert('Failed to delete item.');
      }
    }
  };

  // Order volume metrics
  const completedCount = orders.filter(o => o.status === 'Completed' || o.status === 'completed').length;
  const activeCount = orders.filter(o => o.status === 'Received' || o.status === 'received' || o.status === 'Baking' || o.status === 'baking').length;
  const pendingApprovalOrders = orders.filter(o => o.status === 'pending_approval');

  // Filter items by category
  const filteredMenuItems = menuItems.filter((item) => {
    return activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
  });

  return (
    <div className="bg-[#080504] min-h-screen text-[#FEF6F6] font-sans p-6 pb-24">
      
      {/* Admin Panel Industrial Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#B13818]/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#FDB2B2] mb-1.5 font-bold tracking-widest text-xs uppercase">
            <span className="w-2.5 h-2.5 bg-[#B13818] rounded-full animate-ping" />
            <span>CENTRAL ADMINISTRATIVE TERMINAL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-white tracking-tight flex items-center gap-3">
            Greg's Cafe <span className="text-[#B13818]">Control Console</span>
          </h1>
          <p className="text-xs text-[#675A58] mt-1 font-mono uppercase tracking-wider">
            Catalog CRUD Manager • Real-time Operations & Metrics
          </p>
        </div>

        {/* Cafe Volume Metrics & Action Toolbar */}
        <div className="flex flex-wrap md:flex-nowrap items-stretch gap-4 w-full md:w-auto">
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-[#B13818]/20 flex flex-col justify-center min-w-[120px] flex-grow text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">DISPATCHED</span>
            <span className="text-2xl font-black text-green-400 font-mono mt-0.5">{completedCount}</span>
          </div>
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-[#B13818]/20 flex flex-col justify-center min-w-[120px] flex-grow text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">ACTIVE QUEUE</span>
            <span className="text-2xl font-black text-amber-500 font-mono mt-0.5">{activeCount}</span>
          </div>
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-[#B13818]/20 flex flex-col justify-center min-w-[120px] flex-grow text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">LIFETIME ORDERS</span>
            <span className="text-2xl font-black text-[#FEF6F6] font-mono mt-0.5">{lifetimeOrdersCount}</span>
          </div>
          <button
            onClick={handleExportLedger}
            disabled={isExporting}
            className="bg-[#15100E] hover:bg-[#B13818]/20 text-[#FEF6F6] hover:text-white border border-[#B13818]/40 hover:border-[#D97C7A] px-5 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[140px] flex-grow transition-all duration-200 active:scale-95 shadow-lg group cursor-pointer"
            title="Download completed historical ledger of orders"
          >
            {isExporting ? (
              <span className="w-5 h-5 border-2 border-[#D97C7A] border-t-transparent rounded-full animate-spin my-1" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 text-[#D97C7A] group-hover:scale-110 transition-transform mb-1" />
            )}
            <span className="text-[9px] uppercase font-black tracking-widest text-[#FDB2B2] text-center">Export Orders Ledger (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Order Validation Gate Area */}
      <div className="max-w-6xl mx-auto mb-8 space-y-6">
        {/* Master Toggle Bar */}
        <div className="bg-[#15100E] border border-[#B13818]/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${bypassApprovalGate ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
              Order Validation Gate
            </h3>
            <p className="text-xs text-[#675A58]">
              {bypassApprovalGate 
                ? "Instant Kitchen Routing: [ENABLED] — Orders bypass host verification and route instantly to the kitchen." 
                : "Instant Kitchen Routing: [DISABLED] — Incoming orders are held in the validation queue below until approved."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#675A58]">
              Instant Kitchen Routing:
            </span>
            <button
              onClick={handleToggleBypassGate}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-200 active:scale-95 border cursor-pointer ${
                bypassApprovalGate 
                  ? 'bg-green-950/40 border-green-700 text-green-400' 
                  : 'bg-[#B13818]/20 border-[#B13818] text-[#FDB2B2]'
              }`}
            >
              {bypassApprovalGate ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Incoming Orders Approval Queue */}
        <div className="bg-[#15100E]/40 border border-[#B13818]/15 rounded-3xl p-6">
          <div className="flex items-center justify-between border-b border-[#B13818]/10 pb-3 mb-4">
            <h3 className="text-sm font-bold text-[#FDB2B2] uppercase tracking-wider flex items-center gap-2">
              Incoming Orders Approval View ({pendingApprovalOrders.length})
            </h3>
            <span className="text-[10px] text-[#675A58] font-mono uppercase tracking-widest">Awaiting Verification</span>
          </div>

          {pendingApprovalOrders.length === 0 ? (
            <div className="text-center py-8 text-[#675A58] font-serif italic text-sm">
              No orders are currently waiting in the approval queue.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApprovalOrders.map(order => (
                <div key={order.id} className="bg-[#15100E] border border-[#B13818]/25 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-serif font-black text-white text-base">Token #{formatTokenNumber(order.tokenNumber)}</h4>
                        <span className="text-[10px] text-[#675A58] font-mono uppercase block mt-0.5">
                          Placed At: {formatTime(order.createdAt)}
                        </span>
                      </div>
                      <span className="bg-[#B13818]/20 text-[#FDB2B2] px-2.5 py-1 rounded-md text-xs font-bold border border-[#B13818]/30">
                        Table {order.tableNumber}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#FEF6F6] border-t border-b border-[#B13818]/10 py-3 my-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-medium text-white">{item.name}</span>
                          <span className="font-mono font-bold text-[#FDB2B2] bg-[#B13818]/15 px-1.5 py-0.5 rounded">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'received')}
                      className="bg-green-700 hover:bg-green-600 active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Approve Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'rejected')}
                      className="bg-[#B13818]/20 hover:bg-[#B13818]/40 border border-[#B13818]/50 active:scale-95 text-[#FDB2B2] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Reject / Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Split Portal Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT/MIDDLE PANEL: Menu Inventory CRUD Editor (3/4 Width) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B13818]/20 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Coffee className="w-5 h-5 text-[#B13818]" />
              Menu Catalog Grid ({filteredMenuItems.length})
            </h2>

            {/* Horizontal Category Pill Switches */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategoryFilter(category.key as CategoryKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategoryFilter === category.key
                      ? 'bg-[#B13818] text-white'
                      : 'bg-[#15100E] text-[#675A58] hover:text-[#FEF6F6] hover:bg-[#1e1715]'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Database Grid representation of Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMenuItems.map((item) => (
              <div 
                key={item.id} 
                className={`bg-[#15100E] border rounded-2xl p-4 flex gap-4 items-center transition-all hover:border-[#B13818]/50 ${
                  item.available ? 'border-[#B13818]/20' : 'border-[#B13818]/10 opacity-60'
                }`}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-xl object-cover bg-[#080504] flex-shrink-0 border border-[#B13818]/15"
                />

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-mono font-bold bg-[#B13818]/20 text-[#FDB2B2] px-1.5 py-0.5 rounded uppercase">
                      {CATEGORIES.find(c => c.key === item.category)?.label || item.category}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <h4 className="font-bold text-white text-sm truncate leading-snug">{item.name}</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[#FDB2B2] font-serif font-black text-sm">₹{item.price}</span>
                    <span className="text-[10px] text-[#675A58] truncate max-w-[120px] font-sans font-medium">
                      {item.description}
                    </span>
                  </div>
                </div>

                {/* Edit & Stock Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0 pl-1">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl bg-[#1e1715] hover:bg-[#B13818]/30 text-[#FDB2B2] border border-[#B13818]/30 transition-all active:scale-95 flex items-center justify-center"
                    title="Edit complete menu item details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleQuickAvailability(item.id, item.available)}
                    className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                      item.available
                        ? 'bg-[#15100E] hover:bg-red-950/25 border border-red-900/40 text-red-400'
                        : 'bg-[#B13818]/20 hover:bg-[#B13818]/40 border border-[#B13818]/50 text-[#FDB2B2]'
                    }`}
                    title={item.available ? 'Mark Out of Stock' : 'Mark In Stock'}
                  >
                    {item.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Quick Action & View Switcher (1/4 Width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border-b border-[#B13818]/20 pb-2">
            <h2 className="text-sm font-bold text-[#675A58] uppercase tracking-wide">
              Admin Quick Actions
            </h2>
          </div>

          <div className="space-y-4">
            {/* Cafe Status: OPEN / CLOSED Toggle Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isClosed 
                ? 'bg-[#B13818]/10 border-[#B13818] shadow-[0_4px_20px_rgba(177,56,24,0.15)]' 
                : 'bg-green-950/10 border-green-800 shadow-[0_4px_20px_rgba(34,197,94,0.1)]'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#FDB2B2] tracking-wider font-mono">
                  Cafe Status: OPEN / CLOSED
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1 ${
                  isClosed ? 'bg-[#B13818] text-white animate-pulse' : 'bg-green-700 text-white'
                }`}>
                  {isClosed ? 'CLOSED' : 'OPEN'}
                </span>
              </div>

              <button
                onClick={handleToggleCafeStatus}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isClosed
                    ? 'bg-green-700 hover:bg-green-600 text-white'
                    : 'bg-[#B13818] hover:bg-[#D97C7A] text-white hover:text-[#080504]'
                }`}
              >
                {isClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isClosed ? 'OPEN CAFE' : 'CLOSE CAFE'}</span>
              </button>
            </div>

            {/* Create New Item Button */}
            <button
              onClick={handleOpenAddModal}
              className="w-full bg-[#B13818] hover:bg-[#D97C7A] text-white hover:text-[#080504] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[3px]" />
              <span>Add New Delicacy</span>
            </button>

            {/* Chef View Quick Swap Trigger */}
            <div className="bg-[#15100E] border border-[#B13818]/20 rounded-2xl p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-xs font-bold text-[#FDB2B2] uppercase tracking-wider">
                  Live View Swap
                </h3>
                <p className="text-[11px] text-[#675A58] mt-1 leading-relaxed">
                  Swap instantly into the Kitchen display monitor view without entering the PIN again.
                </p>
              </div>

              <button
                onClick={onSwitchToChef}
                className="w-full bg-[#1e1715] hover:bg-[#B13818]/20 text-[#FEF6F6] border border-[#B13818]/40 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ChefHat className="w-4 h-4 text-[#D97C7A]" />
                <span>Switch to Chef Deck</span>
              </button>
            </div>

            {/* System Status Banner */}
            <div className="bg-[#15100E] border border-green-950/40 rounded-2xl p-4 flex gap-3 items-start">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mt-1 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block">
                  SYSTEM OPERATIONAL
                </span>
                <span className="text-[11px] text-[#675A58] mt-0.5 block leading-normal">
                  All cafe tablets and kitchen displays are fully synced with Google Firestore.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD NEW MENU ITEM */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080504] border-2 border-[#B13818] rounded-3xl p-6 sm:p-8 max-w-[450px] w-full text-[#FEF6F6] relative z-10 shadow-[0_20px_50px_rgba(177,56,24,0.25)]"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-[#675A58] hover:text-[#FEF6F6] p-1.5 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B13818]/10 border border-[#B13818]/40 flex items-center justify-center text-[#FDB2B2]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-black text-white">Add New Delicacy</h3>
                  <p className="text-[11px] text-[#675A58] font-sans">Introduce a fresh delicacy to Greg's live menu</p>
                </div>
              </div>

              {addError && (
                <div className="mb-4 bg-red-950/30 border border-red-900/60 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400 font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <form onSubmit={handleCreateItem} className="space-y-4">
                {/* Item Title Input */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Item Title
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Vanilla Cortado"
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-[#675A58]/60 text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price Value Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      Price Value (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                      placeholder="e.g. 295"
                      className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-[#675A58]/60 text-white font-mono font-bold"
                    />
                  </div>

                  {/* Category Selection Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Category Group
                    </label>
                    <select
                      value={addCategory}
                      onChange={(e) => setAddCategory(e.target.value as CategoryKey)}
                      className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-3 py-3 text-sm focus:outline-none text-white font-semibold"
                    >
                      {CATEGORIES.filter(c => c.key !== 'all').map((c) => (
                        <option key={c.key} value={c.key} className="bg-[#15100E] text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Diet Classification Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-[#B13818]/60 flex items-center justify-center p-0.5 rounded-sm bg-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    </span>
                    Diet Classification
                  </label>
                  <select
                    value={addDietType}
                    onChange={(e) => setAddDietType(e.target.value as 'VEG' | 'NON-VEG')}
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-3 py-3 text-sm focus:outline-none text-white font-semibold"
                  >
                    <option value="VEG" className="bg-[#15100E] text-white">VEG (Vegetarian)</option>
                    <option value="NON-VEG" className="bg-[#15100E] text-white">NON-VEG (Non-Vegetarian)</option>
                  </select>
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image Resource Address
                  </label>
                  <input
                    type="url"
                    value={addImageUrl}
                    onChange={(e) => setAddImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-[#675A58]/60 text-white text-xs font-mono"
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5">
                    Delicacy Description
                  </label>
                  <textarea
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="e.g. Silky warm latte infused with Madagascar bourbon vanilla."
                    rows={3}
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-[#675A58]/60 text-white font-medium"
                  />
                </div>

                {/* Modal Footer Controls */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 bg-[#15100E] border border-[#B13818]/30 hover:bg-white/5 py-3 rounded-xl text-xs font-bold transition-all text-[#675A58] hover:text-[#FEF6F6] active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#B13818] hover:bg-[#D97C7A] text-white hover:text-[#080504] py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    Add Delicacy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT EXISTING MENU ITEM (CRUD Configuration Modal) */}
      <AnimatePresence>
        {isEditModalOpen && selectedItemToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedItemToEdit(null);
              }}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080504] border-2 border-[#B13818] rounded-3xl p-6 sm:p-8 max-w-[450px] w-full text-[#FEF6F6] relative z-10 shadow-[0_20px_50px_rgba(177,56,24,0.25)]"
            >
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedItemToEdit(null);
                }}
                className="absolute top-4 right-4 text-[#675A58] hover:text-[#FEF6F6] p-1.5 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B13818]/10 border border-[#B13818]/40 flex items-center justify-center text-[#FDB2B2]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-black text-white">Edit Delicacy</h3>
                  <p className="text-[11px] text-[#675A58] font-sans">Modify properties of "{selectedItemToEdit.name}"</p>
                </div>
              </div>

              {editError && (
                <div className="mb-4 bg-red-950/30 border border-red-900/60 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400 font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditItem} className="space-y-4">
                {/* Item Title Input */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Item Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-[#675A58]/60 text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price Value Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      Price Value (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-[#675A58]/60 text-white font-mono font-bold"
                    />
                  </div>

                  {/* Category Selection Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Category Group
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as CategoryKey)}
                      className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-3 py-3 text-sm focus:outline-none text-white font-semibold"
                    >
                      {CATEGORIES.filter(c => c.key !== 'all').map((c) => (
                        <option key={c.key} value={c.key} className="bg-[#15100E] text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Diet Classification Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-[#B13818]/60 flex items-center justify-center p-0.5 rounded-sm bg-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    </span>
                    Diet Classification
                  </label>
                  <select
                    value={editDietType}
                    onChange={(e) => setEditDietType(e.target.value as 'VEG' | 'NON-VEG')}
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-3 py-3 text-sm focus:outline-none text-white font-semibold"
                  >
                    <option value="VEG" className="bg-[#15100E] text-white">VEG (Vegetarian)</option>
                    <option value="NON-VEG" className="bg-[#15100E] text-white">NON-VEG (Non-Vegetarian)</option>
                  </select>
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image Resource Address
                  </label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-3 text-sm focus:outline-none placeholder-[#675A58]/60 text-white text-xs font-mono"
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-[11px] font-bold text-[#FDB2B2] uppercase tracking-wider mb-1.5">
                    Delicacy Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#15100E] border border-[#B13818]/30 focus:border-[#D97C7A] rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-[#675A58]/60 text-white font-medium"
                  />
                </div>

                {/* In Stock Availability Toggle */}
                <div className="flex items-center justify-between bg-[#15100E] border border-[#B13818]/20 rounded-xl p-4">
                  <div>
                    <span className="text-xs font-bold text-white block">Availability Status</span>
                    <span className="text-[10px] text-[#675A58]">Should customers see this on the active menu?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditAvailable(!editAvailable)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all select-none ${
                      editAvailable 
                        ? 'bg-[#B13818] text-white' 
                        : 'bg-red-950/40 text-red-400 border border-red-900/40'
                    }`}
                  >
                    {editAvailable ? 'In Stock' : 'Sold Out'}
                  </button>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(selectedItemToEdit.id)}
                    className="bg-red-950/20 text-red-500 hover:bg-red-950/40 border border-red-900/30 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 order-last sm:order-first"
                    title="Permanently remove this delicacy from Firestore catalog"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Delicacy</span>
                  </button>

                  <div className="flex gap-2 flex-grow">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setSelectedItemToEdit(null);
                      }}
                      className="flex-1 bg-[#15100E] border border-[#B13818]/30 hover:bg-white/5 py-3 rounded-xl text-xs font-bold transition-all text-[#675A58] hover:text-[#FEF6F6] text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#B13818] hover:bg-[#D97C7A] text-white hover:text-[#080504] py-3 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
