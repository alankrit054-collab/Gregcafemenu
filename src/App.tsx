import { useState, useEffect } from 'react';
import { MenuItem } from './types';
import { subscribeMenuItems } from './dbService';
import { RoleSwitcher } from './components/RoleSwitcher';
import { CustomerView } from './components/CustomerView';
import { ChefView } from './components/ChefView';
import { AdminView } from './components/AdminView';
import { AdminPinModal } from './components/AdminPinModal';
import { BrewingLoader } from './components/BrewingLoader';
import { QRIntroSplash } from './components/QRIntroSplash';

// Helper functions to parse the restaurant slug dynamically from the path or query parameters
const getSlugFromUrl = (): string => {
  // 1. Check for query parameter override (e.g. ?slug=greg-cafe)
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  if (slugParam) return slugParam;

  // 2. Check for dynamic pathname segment (e.g. /greg-cafe)
  const pathname = window.location.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0];
    // Exclude system asset folders or APIs
    if (firstSegment !== 'assets' && firstSegment !== 'api') {
      return firstSegment;
    }
  }

  // 3. Fallback default
  return 'greg-cafe';
};

const getRestaurantNameFromSlug = (rawSlug: string): string => {
  if (rawSlug.toLowerCase().includes('greg')) {
    return "Greg's Cafe";
  }
  // Standard title-case translation for other multi-tenant dynamic cafe nodes
  return rawSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function App() {
  const [role, setRole] = useState<'customer' | 'chef' | 'admin'>('customer');
  const [tableNumber, setTableNumber] = useState('4');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [restaurantName, setRestaurantName] = useState(() => {
    const rawSlug = getSlugFromUrl();
    return getRestaurantNameFromSlug(rawSlug);
  });

  // Dynamic Tab Title & Browser Metadata Injection
  useEffect(() => {
    // Dynamically override the tab header title
    document.title = `${restaurantName} | Live Menu`;

    // Dynamically override or create the head description meta tag
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute(
      'content',
      `Welcome to ${restaurantName}! Scan your table QR code, browse our premium delicacies, and fire your order tokens directly to the kitchen line instantly.`
    );
  }, [restaurantName]);

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
        <h2 className="text-lg font-serif font-bold text-[#B13818] tracking-tight">
          Loading {restaurantName}...
        </h2>
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
        restaurantName={restaurantName}
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
