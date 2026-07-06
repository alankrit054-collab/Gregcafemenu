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
  Play
} from 'lucide-react';
import { Order } from '../types';
import { subscribeOrders, updateOrderStatus } from '../dbService';
import { motion, AnimatePresence } from 'motion/react';

export const ChefView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticker, setTicker] = useState(0);

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

  const activeOrders = orders.filter(o => o.status === 'Received' || o.status === 'Baking');
  const completedOrders = orders.filter(o => o.status === 'Completed');

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

        {/* Multi-device Status Summary */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-[#B13818]/40 flex flex-col justify-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">ACTIVE QUEUE</span>
            <span className="text-2xl font-black text-[#FDB2B2] font-mono mt-0.5">{activeOrders.length}</span>
          </div>
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-green-950 flex flex-col justify-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">COMPLETED TODAY</span>
            <span className="text-2xl font-black text-green-400 font-mono mt-0.5">{completedOrders.length}</span>
          </div>
          <div className="bg-[#15100E] px-5 py-3 rounded-2xl border border-blue-950 flex flex-col justify-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#675A58]">KITCHEN TEMP</span>
            <span className="text-2xl font-black text-amber-500 font-mono mt-0.5">24.5°C</span>
          </div>
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
                  const isBaking = order.status === 'Baking';
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
                              Token #{order.tokenNumber}
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
                      <span className="font-serif font-black text-white text-xs">Token #{order.tokenNumber}</span>
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
