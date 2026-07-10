import React from 'react';
import { User, ChefHat, Settings } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'customer' | 'chef' | 'admin';
  onChangeRole: (role: 'customer' | 'chef' | 'admin') => void;
  tableNumber: string;
  restaurantName?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onChangeRole,
  tableNumber,
  restaurantName = "Greg's Cafe",
}) => {
  return (
    <div className="bg-[#080504] text-[#FEF6F6] py-2 px-4 flex flex-wrap items-center justify-between text-xs font-sans border-b border-[#D97C7A]/20 shadow-sm z-50 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="font-serif font-bold text-sm text-[#D97C7A] tracking-tight leading-none">{restaurantName}</span>
          <span className="text-[8px] uppercase tracking-wider text-[#675A58] font-sans mt-0.5">EST. 2026</span>
        </div>
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
          <div className="flex items-center gap-1.5 bg-[#675A58]/20 px-2.5 py-1 rounded-md border border-[#675A58]/30 select-none">
            <span className="text-[#675A58]">Table:</span>
            <span className="text-[#FDB2B2] font-bold tracking-wide">{tableNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
};
