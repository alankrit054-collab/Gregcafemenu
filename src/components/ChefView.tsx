import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle, 
  Clock, 
  CheckSquare, 
  Inbox, 
  Activity,
  Award,
  AlertTriangle,
  Play,
  Lock,
  Unlock,
  Delete,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';
import { subscribeOrders, updateOrderStatus, formatTokenNumber, archiveCompletedOrders } from '../dbService';
import { motion, AnimatePresence } from 'motion/react';

export const ChefView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticker, setTicker] = useState(0);

  // Security authorization states for Chef Deck
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Keyboard controls for PIN entry
  useEffect(() => {
    if (isAuthorized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handleVerify();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthorized, pin]);

  const handleKeyPress = (digit: string) => {
    if (error) setError(null);
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (error) setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleVerify = () => {
    if (pin === '0000') {
      setIsAuthorized(true);
    } else {
      setError('ACCESS DENIED: INVALID SECURITY PIN');
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 500);
    }
  };

  // Auto-verify when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        handleVerify();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  // Active elapsed time ticker - updates every 1 second to keep timers fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to live orders stream from Firestore
  useEffect(() => {
    const unsubscribe = subscribeOrders((liveOrders) => {
      setOrders(liveOrders);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'Received' | 'Baking' | 'Completed') => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const [isClearingTickets, setIsClearingTickets] = useState(false);

  const handleClearCompletedTickets = async () => {
    if (completedOrders.length === 0) return;
    setIsClearingTickets(true);
    try {
      await archiveCompletedOrders();
    } catch (error) {
      console.error("Error archiving completed tickets:", error);
      alert("Failed to clear completed tickets. Please try again.");
    } finally {
      setIsClearingTickets(false);
    }
  };

  const activeOrders = orders.filter(o => o.status === 'Received' || o.status === 'received' || o.status === 'Baking' || o.status === 'baking');
  const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'completed');

  // Precise elapsed time calculation
  const getElapsedTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) {
      return `${diffSecs}s ago`;
    }
    const diffMins = Math.floor(diffSecs / 60);
    const remainingSecs = diffSecs % 60;
    return `${diffMins}m ${remainingSecs}s ago`;
  };

  // Human friendly formatted timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (!isAuthorized) {
    return (
      <div className="bg-[#080504] min-h-screen text-[#FEF6F6] font-sans flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: shake ? [-10, 10, -10, 10, -5, 5, 0] : 0
          }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="max-w-md w-full flex flex-col items-center border-2 border-[#B13818] bg-[#15100E] p-8 rounded-3xl shadow-[0_25px_60px_-15px_rgba(177,56,24,0.3)]"
        >
          {/* Security Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#B13818]/10 border border-[#B13818]/40 flex items-center justify-center text-[#FDB2B2] mb-4">
              <Lock className="w-6 h-6 stroke-[2px]" />
            </div>
            <h2 className="text-xs font-bold tracking-widest text-[#FDB2B2] uppercase font-sans">
              KITCHEN SECURITY TERMINAL
            </h2>
            <h1 className="text-2xl font-serif font-black tracking-tight text-white mt-1">
              Chef Access Authorization
            </h1>
            <p className="text-[10px] text-[#675A58] font-mono mt-1 uppercase tracking-wider">
              Enter 4-Digit Security PIN Code
            </p>
          </div>

          {/* PIN Bubble Display */}
          <div className="flex gap-4 justify-center items-center h-10 mb-6">
            {[0, 1, 2, 3].map((index) => {
              const isActive = pin.length > index;
              return (
                <motion.div
                  key={index}
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#FDB2B2] border-[#FDB2B2] shadow-[0_0_8px_rgba(253,178,178,0.6)]' 
                      : 'bg-[#080504] border-[#B13818]/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Warning/Error Message */}
          <div className="h-6 mb-6 w-full text-center">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-900 rounded-full text-[10px] text-red-400 font-bold tracking-wider font-sans uppercase shadow-sm"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3x4 Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeyPress(digit)}
                className="h-14 rounded-2xl bg-[#080504] hover:bg-[#B13818]/20 active:bg-[#B13818]/30 border border-[#B13818]/20 hover:border-[#D97C7A]/40 text-xl font-bold font-mono transition-all active:scale-95 text-[#FEF6F6] select-none cursor-pointer"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="h-14 rounded-2xl bg-[#080504]/40 hover:bg-[#B13818]/10 active:bg-[#B13818]/20 border border-[#B13818]/10 text-xs font-bold font-sans tracking-wider uppercase transition-all text-[#675A58] hover:text-[#FEF6F6] select-none cursor-pointer"
            >
              Clear
            </button>

            {/* Zero */}
            <button
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-[#080504] hover:bg-[#B13818]/20 active:bg-[#B13818]/30 border border-[#B13818]/20 hover:border-[#D97C7A]/40 text-xl font-bold font-mono transition-all active:scale-95 text-[#FEF6F6] select-none cursor-pointer"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-[#080504]/40 hover:bg-[#B13818]/10 active:bg-[#B13818]/20 border border-[#B13818]/10 flex items-center justify-center transition-all text-[#675A58] hover:text-[#FEF6F6] select-none cursor-pointer"
              title="Delete last digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[10px] text-[#675A58] font-mono tracking-wide text-center">
            DEFAULT KITCHEN PIN: <span className="text-[#FDB2B2] font-bold">0000</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#080504] min-h-screen text-[#FEF6F6] font-sans p-6 pb-24">
      
      {/* Upper Industrial Kitchen Monitor Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#B13818]/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#FDB2B2] mb-1.5 font-bold tracking-widest text-xs uppercase">
            <span className="w-2.5 h-2.5 bg-[#B13818] rounded-full animate-ping" />
            <span>KITCHEN MONITORING STATION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-white tracking-tight flex items-center gap-3">
            Greg's Cafe <span className="text-[#B13818]">Live Chef Deck</span>
          </h1>
          <p className="text-xs text-[#675A58] mt-1 font-mono uppercase tracking-wider">
            Industrial Fulfillment Terminal • Real-Time Database Sync
          </p>
        </div>

        {/* Multi-device Status Summary & Master Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-[#B13818]/40 flex flex-col justify-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">ACTIVE QUEUE</span>
            <span className="text-2xl font-black text-[#FDB2B2] font-mono mt-0.5">{activeOrders.length}</span>
          </div>
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-green-950 flex flex-col justify-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">COMPLETED TODAY</span>
            <span className="text-2xl font-black text-green-400 font-mono mt-0.5">{completedOrders.length}</span>
          </div>
          <button
            onClick={handleClearCompletedTickets}
            disabled={isClearingTickets || completedOrders.length === 0}
            className={`px-5 py-4 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 h-full ${
              completedOrders.length === 0
                ? 'bg-[#15100E]/20 text-[#675A58] border-[#675A58]/10 cursor-not-allowed select-none'
                : 'bg-[#15100E] border-[#B13818]/50 hover:border-[#D97C7A] text-[#FDB2B2] hover:bg-[#B13818]/10 cursor-pointer shadow-lg'
            }`}
            title="Archive all finished tickets from this display"
          >
            {isClearingTickets ? (
              <span className="w-3.5 h-3.5 border-2 border-[#D97C7A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckSquare className="w-4 h-4 text-[#D97C7A]" />
            )}
            <span>Clear Completed Station Tickets</span>
          </button>
        </div>
      </div>

      {/* Main Grid Matrix Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Dynamic Order Matrix Grid (3/4 width on desktop) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-[#B13818]/20 pb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-5 h-5 text-[#B13818]" />
              Active Orders Grid ({activeOrders.length})
            </h2>
            <span className="text-xs text-[#675A58] font-mono uppercase">SORTED BY PRIORITY QUEUE</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="text-center py-20 bg-[#15100E]/50 rounded-3xl border-2 border-dashed border-[#B13818]/20 flex flex-col items-center justify-center">
              <Inbox className="w-16 h-16 text-[#675A58] mb-4 stroke-[1.5]" />
              <p className="text-xl font-bold text-white font-serif">Kitchen Queue is Clear</p>
              <p className="text-sm text-[#675A58] mt-1 max-w-sm">
                No active custom orders are in preparation right now. Customer order tickets will populate here live.
              </p>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {activeOrders.map((order) => {
                  const isBaking = order.status === 'Baking' || order.status === 'baking';
                  return (
                    <motion.div
                      layout
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: -40, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden relative border ${
                        isBaking 
                          ? 'border-[#D97C7A] bg-[#1a1211] shadow-[0_4px_25px_rgba(217,124,122,0.15)] ring-1 ring-[#D97C7A]/20' 
                          : 'border-[#B13818]/30 bg-[#15100E]'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className={`p-4 flex justify-between items-start border-b ${
                        isBaking ? 'bg-[#B13818]/15 border-[#D97C7A]/30' : 'bg-[#1e1715] border-[#B13818]/20'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-serif font-black tracking-tight text-white">
                              Token #{formatTokenNumber(order.tokenNumber)}
                            </span>
                            {isBaking && (
                              <span className="text-[9px] font-bold bg-[#D97C7A] text-[#080504] px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                Baking
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#675A58] font-mono mt-0.5 block">
                            PLACED AT: {formatTime(order.createdAt)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-[#FDB2B2] bg-[#B13818]/30 px-2.5 py-1 rounded-md border border-[#B13818]/40">
                            T-{order.tableNumber}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Body / Order Items */}
                      <div className="p-5 flex-grow">
                        <ul className="space-y-3">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex items-start gap-3 border-b border-[#B13818]/10 pb-2.5 last:border-0 last:pb-0">
                              {/* Oversized bold multiplier quantities */}
                              <span className="text-lg font-mono font-black text-[#FDB2B2] bg-[#B13818]/20 px-2 py-0.5 rounded border border-[#B13818]/30 min-w-[36px] text-center">
                                {item.quantity}x
                              </span>
                              <div className="min-w-0">
                                <span className="text-sm font-bold text-[#FEF6F6] block leading-tight">
                                  {item.name}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Ticket Footer (Live counter & actions) */}
                      <div className="p-4 bg-[#1e1715]/50 border-t border-[#B13818]/15">
                        {/* Live active elapsed time counter */}
                        <div className="flex items-center justify-between text-xs text-[#675A58] mb-3 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isBaking ? 'text-[#D97C7A] animate-spin' : 'text-[#675A58]'}`} />
                            <span className={isBaking ? 'text-[#FDB2B2] font-semibold' : ''}>
                              ELAPSED: {getElapsedTime(order.createdAt)}
                            </span>
                          </div>
                          <span>LIVE SYNC</span>
                        </div>

                        {/* Kitchen Status Lifecycle Controls */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Baking')}
                            disabled={isBaking}
                            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isBaking 
                                ? 'bg-[#675A58]/20 text-[#675A58] border border-[#675A58]/10 cursor-not-allowed'
                                : 'bg-[#15100E] text-[#FDB2B2] hover:bg-[#B13818]/30 border border-[#B13818]/50 active:scale-95'
                            }`}
                          >
                            <Flame className="w-3.5 h-3.5 text-[#D97C7A]" />
                            Mark Baking
                          </button>
                          
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Completed')}
                            className="bg-[#B13818] hover:bg-[#D97C7A] text-white hover:text-[#080504] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Industrial Sidebar (Completed history) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between border-b border-[#B13818]/20 pb-2">
            <h2 className="text-sm font-bold text-[#675A58] flex items-center gap-1.5 uppercase tracking-wide">
              <CheckSquare className="w-4 h-4 text-green-500" />
              Ready & Dispatched ({completedOrders.length})
            </h2>
          </div>

          <div className="bg-[#15100E] border border-[#B13818]/20 rounded-2xl p-4 space-y-3 max-h-[72vh] overflow-y-auto">
            {completedOrders.length === 0 ? (
              <div className="text-center py-12 text-[#675A58]">
                <p className="text-xs font-mono uppercase tracking-wider">No completed orders</p>
                <p className="text-[10px] mt-1">Ready queue will populate here upon dispatch.</p>
              </div>
            ) : (
              completedOrders.slice().reverse().map((order) => (
                <div key={order.id} className="bg-[#080504]/60 p-3.5 rounded-xl border border-green-950/50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-serif font-black text-white text-xs">Token #{formatTokenNumber(order.tokenNumber)}</span>
                      <span className="text-[10px] bg-green-950 text-green-400 font-bold px-1.5 py-0.5 rounded">
                        T-{order.tableNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#675A58] font-sans space-y-0.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="truncate">
                          <span className="font-bold text-[#FDB2B2] mr-1">{item.quantity}x</span> {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#B13818]/10 text-[9px] text-[#675A58] font-mono">
                    <span>DISPATCHED</span>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Baking')}
                      className="text-[#D97C7A] hover:underline"
                    >
                      Revert
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
