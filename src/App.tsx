import { useState, useEffect } from 'react';
import { MenuItem } from './types';
import { subscribeMenuItems } from './dbService';
import { RoleSwitcher } from './components/RoleSwitcher';
import { CustomerView } from './components/CustomerView';
import { ChefView } from './components/ChefView';
import { AdminView } from './components/AdminView';
import { AdminPinModal } from './components/AdminPinModal';

export default function App() {
  const [role, setRole] = useState<'customer' | 'chef' | 'admin'>('customer');
  const [tableNumber, setTableNumber] = useState('4');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Security authorization states
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false);

  // Parse URL query parameters on initial boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const tableParam = params.get('table');

    if (roleParam === 'chef' || roleParam === 'customer') {
      setRole(roleParam);
    } else if (roleParam === 'admin') {
      // Direct deep-link to Admin requires authentication first
      setRole('customer');
      setIsAdminPinOpen(true);
    }

    if (tableParam) {
      setTableNumber(tableParam);
    }
  }, []);

  // Listen to live menu items from Firestore
  useEffect(() => {
    const unsubscribe = subscribeMenuItems((items) => {
      setMenuItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = (newRole: 'customer' | 'chef' | 'admin') => {
    if (newRole === 'admin' && !isAdminAuthorized) {
      setIsAdminPinOpen(true);
      return;
    }
    setRole(newRole);
    // Dynamically update URL parameter for visual integrity and deep linking
    const params = new URLSearchParams(window.location.search);
    params.set('role', newRole);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleTableChange = (newTable: string) => {
    setTableNumber(newTable);
    // Dynamically update URL parameter
    const params = new URLSearchParams(window.location.search);
    params.set('table', newTable);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleAdminPinSuccess = () => {
    setIsAdminAuthorized(true);
    setIsAdminPinOpen(false);
    setRole('admin');

    // Update URL to reflect Admin role
    const params = new URLSearchParams(window.location.search);
    params.set('role', 'admin');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="bg-[#FEF6F6] min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#D97C7A] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-serif font-bold text-[#B13818] animate-pulse">Initializing Greg's Cafe...</h2>
        <p className="text-xs text-[#675A58] mt-1">Connecting to Firestore Live Sync database</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF6F6]">
      {/* Top navigation bar */}
      <RoleSwitcher
        currentRole={role}
        onChangeRole={handleRoleChange}
        tableNumber={tableNumber}
        onChangeTable={handleTableChange}
      />

      {/* Primary view dispatcher */}
      <main className="flex-grow">
        {role === 'customer' && (
          <CustomerView 
            menuItems={menuItems} 
            tableNumber={tableNumber} 
            onOpenAdminPin={() => setIsAdminPinOpen(true)}
            onSwitchToChef={() => handleRoleChange('chef')}
          />
        )}
        {role === 'chef' && <ChefView />}
        {role === 'admin' && (
          <AdminView 
            menuItems={menuItems} 
            onSwitchToChef={() => handleRoleChange('chef')} 
          />
        )}
      </main>

      {/* Secure Numerical Keypad Modal Overlay */}
      <AdminPinModal
        isOpen={isAdminPinOpen}
        onClose={() => setIsAdminPinOpen(false)}
        onSuccess={handleAdminPinSuccess}
      />
    </div>
  );
}
