import React from 'react';
import { User, ChefHat, Settings } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'customer' | 'chef' | 'admin';
  onChangeRole: (role: 'customer' | 'chef' | 'admin') => void;
  tableNumber: string;
  onChangeTable: (table: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onChangeRole,
  tableNumber,
  onChangeTable,
}) => {
  return (
    <div className="bg-[#080504] text-[#FEF6F6] py-2 px-4 flex flex-wrap items-center justify-between text-xs font-sans border-b border-[#D97C7A]/20 shadow-sm z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <span className="font-serif font-bold text-sm text-[#D97C7A] tracking-tight">Greg's Cafe</span>
        <span className="text-[9px] uppercase tracking-wider text-[#675A58] border border-[#675A58]/30 px-1.5 py-0.5 rounded font-sans">EST. 2026</span>
      </div>
      
      <div className="flex items-center gap-3 mt-1 sm:mt-0">
        {currentRole !== 'customer' && (
          <div className="flex bg-[#675A58]/30 rounded-lg p-0.5 border border-[#675A58]/50">
            <button
              onClick={() => onChangeRole('customer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                currentRole === 'customer'
                  ? 'bg-[#D97C7A] text-[#080504] font-medium'
                  : 'text-[#FEF6F6] hover:bg-white/5'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => onChangeRole('chef')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                currentRole === 'chef'
                  ? 'bg-[#D97C7A] text-[#080504] font-medium'
                  : 'text-[#FEF6F6] hover:bg-white/5'
              }`}
            >
              <ChefHat className="w-3 h-3" />
              <span>Chef View</span>
            </button>
            <button
              onClick={() => onChangeRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                currentRole === 'admin'
                  ? 'bg-[#D97C7A] text-[#080504] font-medium'
                  : 'text-[#FEF6F6] hover:bg-white/5'
              }`}
            >
              <Settings className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        )}

        {currentRole === 'customer' && (
          <div className="flex items-center gap-1 bg-[#675A58]/20 px-2 py-1 rounded-md border border-[#675A58]/30">
            <span className="text-[#675A58]">Table:</span>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => onChangeTable(e.target.value)}
              className="w-10 bg-transparent text-center text-[#FDB2B2] font-bold focus:outline-none"
              placeholder="4"
              title="Change table number"
            />
          </div>
        )}
      </div>
    </div>
  );
};
