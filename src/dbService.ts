import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  query, 
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';
import { MenuItem, Order, CartItem, OrderItem } from './types';
import { INITIAL_MENU_ITEMS } from './initialMenu';

const MENU_COLLECTION = 'menu_items';
const ORDERS_COLLECTION = 'orders';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const auth = getAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Utility to pad a token number to exactly 3 digits (e.g. 001, 042).
 */
export function formatTokenNumber(num: number | string): string {
  return String(num).padStart(3, '0');
}

/**
 * Seeds the initial menu items to Firestore if the collection is empty.
 */
export async function seedMenuItemsIfEmpty() {
  const menuRef = collection(db, MENU_COLLECTION);
  let snapshot;
  try {
    snapshot = await getDocs(menuRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, MENU_COLLECTION);
  }

  if (snapshot.empty) {
    console.log("Menu items collection is empty. Seeding INITIAL_MENU_ITEMS...");
    const batch = writeBatch(db);
    for (const item of INITIAL_MENU_ITEMS) {
      const docRef = doc(db, MENU_COLLECTION, item.id);
      batch.set(docRef, item);
    }
    try {
      await batch.commit();
      console.log("Successfully seeded all menu items!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, MENU_COLLECTION);
    }
  }
}

/**
 * Subscribes to live updates of the menu items.
 * Triggers callback whenever any item is edited or added.
 */
export function subscribeMenuItems(callback: (items: MenuItem[]) => void) {
  // Ensure we seed first if empty
  seedMenuItemsIfEmpty();

  const menuRef = collection(db, MENU_COLLECTION);
  return onSnapshot(menuRef, (snapshot) => {
    const items: MenuItem[] = [];
    snapshot.forEach((doc) => {
      items.push({ ...doc.data() } as MenuItem);
    });
    // Fallback if empty and not yet seeded
    if (items.length === 0) {
      callback(INITIAL_MENU_ITEMS);
    } else {
      // Sort by id or category to keep layout consistent
      items.sort((a, b) => a.id.localeCompare(b.id));
      callback(items);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, MENU_COLLECTION);
  });
}

/**
 * Places an order, calculates a sequential token number, and adds to Firestore.
 */
export async function placeOrder(
  tableNumber: string, 
  cartItems: CartItem[], 
  totalAmount: number
): Promise<Order> {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  
  // Calculate sequential token number with calendar-day automatic reset logic
  let tokenNumber = 1; // Start sequence at 1 (001) for a brand new day or first order
  const getCalendarDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getCalendarDateString(new Date());

  try {
    const snapshot = await getDocs(ordersRef);
    if (!snapshot.empty) {
      // Find the most recent order overall by checking timestamps
      let mostRecentOrder: any = null;
      let maxCreatedAtTime = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const time = new Date(data.createdAt).getTime();
          if (time > maxCreatedAtTime) {
            maxCreatedAtTime = time;
            mostRecentOrder = data;
          }
        }
      });

      let isNewDay = true;
      if (mostRecentOrder) {
        const mostRecentDateStr = getCalendarDateString(new Date(mostRecentOrder.createdAt));
        if (mostRecentDateStr === todayStr) {
          isNewDay = false;
        }
      }

      if (isNewDay) {
        tokenNumber = 1; // force start fresh at exactly 001
      } else {
        // Find highest recorded token value generated earlier that day and increment by 1
        let maxTokenToday = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt && data.tokenNumber && typeof data.tokenNumber === 'number') {
            const oDateStr = getCalendarDateString(new Date(data.createdAt));
            if (oDateStr === todayStr) {
              if (data.tokenNumber > maxTokenToday) {
                maxTokenToday = data.tokenNumber;
              }
            }
          }
        });
        tokenNumber = maxTokenToday + 1;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    }
    console.error("Error calculating token number, falling back to random:", error);
    tokenNumber = Math.floor(Math.random() * 99) + 1; // random safety token starting at 1
  }

  // Fetch current config to check bypass_approval_gate status in real-time
  let bypassApprovalGate = true;
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CAFE_CONFIG_DOC);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.bypass_approval_gate !== undefined) {
        bypassApprovalGate = !!data.bypass_approval_gate;
      }
    }
  } catch (error) {
    console.error("Error reading cafe config for order gate, defaulting to bypass=true:", error);
  }

  const orderItems: OrderItem[] = cartItems.map((item) => ({
    id: item.menuItem.id,
    name: item.menuItem.name,
    price: item.menuItem.price,
    quantity: item.quantity
  }));

  const orderId = `order_${Date.now()}`;
  const newOrder: Order = {
    id: orderId,
    tableNumber: tableNumber || 'N/A',
    tokenNumber: tokenNumber,
    status: bypassApprovalGate ? 'received' : 'pending_approval',
    items: orderItems,
    totalAmount: totalAmount,
    createdAt: new Date().toISOString()
  };

  try {
    // Save to firestore using the orderId as the document identifier
    await setDoc(doc(db, ORDERS_COLLECTION, orderId), newOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${orderId}`);
  }
  return newOrder;
}

/**
 * Subscribes to live updates of all orders.
 * Useful for the chef and admin views to track and update statuses.
 */
export function subscribeOrders(callback: (orders: Order[]) => void) {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(ordersRef, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Order;
      if (data.status !== 'archived' && data.status !== 'Archived') {
        orders.push(data);
      }
    });
    // Sort orders by creation date (newest first for chef, or oldest first for queue priority. Let's do oldest first so chef works in queue order)
    orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
  });
}

/**
 * Subscribes to the live total count of all orders.
 * Regardless of whether the order status is pending, completed, or archived.
 */
export function subscribeAllOrdersCount(callback: (count: number) => void) {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(ordersRef, (snapshot) => {
    callback(snapshot.size);
  }, (error) => {
    console.error("Error fetching live total orders count:", error);
    callback(0);
  });
}

/**
 * Subscribes to a specific order's status live.
 * Crucial for the customer's real-time order tracking container!
 */
export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  return onSnapshot(orderRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback(docSnapshot.data() as Order);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${ORDERS_COLLECTION}/${orderId}`);
  });
}

/**
 * Updates an order status (e.g. from Received to Baking or Completed).
 */
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status']
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  try {
    await updateDoc(orderRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

/**
 * Safely batches and archives all completed or delivered orders.
 */
export async function archiveCompletedOrders(): Promise<void> {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  try {
    const snapshot = await getDocs(ordersRef);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const status = (data.status || '').toLowerCase();
        if (status === 'completed' || status === 'delivered') {
          batch.update(doc.ref, { status: 'archived' });
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ORDERS_COLLECTION);
  }
}

/**
 * Updates a menu item's price in real-time.
 */
export async function updateMenuItemPrice(itemId: string, newPrice: number): Promise<void> {
  const itemRef = doc(db, MENU_COLLECTION, itemId);
  try {
    await updateDoc(itemRef, { price: newPrice });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_COLLECTION}/${itemId}`);
  }
}

/**
 * Updates a menu item's availability in real-time.
 */
export async function updateMenuItemAvailability(itemId: string, available: boolean): Promise<void> {
  const itemRef = doc(db, MENU_COLLECTION, itemId);
  try {
    await updateDoc(itemRef, { available });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_COLLECTION}/${itemId}`);
  }
}

/**
 * Adds a new menu item to Firestore.
 */
export async function addMenuItem(item: Omit<MenuItem, 'id' | 'available'> & { id?: string; available?: boolean }): Promise<void> {
  const itemId = item.id || `item_${Date.now()}`;
  const newItem: MenuItem = {
    ...item,
    id: itemId,
    available: item.available ?? true,
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=200'
  };
  try {
    await setDoc(doc(db, MENU_COLLECTION, itemId), newItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_COLLECTION}/${itemId}`);
  }
}

/**
 * Updates an entire menu item (full edit).
 */
export async function updateMenuItem(item: MenuItem): Promise<void> {
  const itemRef = doc(db, MENU_COLLECTION, item.id);
  try {
    await setDoc(itemRef, item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_COLLECTION}/${item.id}`);
  }
}

/**
 * Deletes a menu item from Firestore.
 */
export async function deleteMenuItem(itemId: string): Promise<void> {
  const itemRef = doc(db, MENU_COLLECTION, itemId);
  try {
    await deleteDoc(itemRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_COLLECTION}/${itemId}`);
  }
}

const CONFIG_COLLECTION = 'config';
const CAFE_CONFIG_DOC = 'cafe';

export interface CafeConfig {
  is_closed: boolean;
  bypass_approval_gate: boolean;
}

/**
 * Subscribes to live updates of the cafe's configuration (is_closed, bypass_approval_gate).
 */
export function subscribeCafeConfig(callback: (config: CafeConfig | null) => void) {
  const docRef = doc(db, CONFIG_COLLECTION, CAFE_CONFIG_DOC);
  return onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback({
        is_closed: !!data.is_closed,
        bypass_approval_gate: data.bypass_approval_gate !== undefined ? !!data.bypass_approval_gate : true
      });
    } else {
      // Return defaults (open, bypass approval gate)
      callback({ is_closed: false, bypass_approval_gate: true });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${CONFIG_COLLECTION}/${CAFE_CONFIG_DOC}`);
  });
}

/**
 * Updates the cafe's is_closed status.
 */
export async function updateCafeStatus(isClosed: boolean): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, CAFE_CONFIG_DOC);
  try {
    await setDoc(docRef, { is_closed: isClosed }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONFIG_COLLECTION}/${CAFE_CONFIG_DOC}`);
  }
}

/**
 * Updates the cafe's bypass_approval_gate status.
 */
export async function updateBypassApprovalGate(bypass: boolean): Promise<void> {
  const docRef = doc(db, CONFIG_COLLECTION, CAFE_CONFIG_DOC);
  try {
    await setDoc(docRef, { bypass_approval_gate: bypass }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONFIG_COLLECTION}/${CAFE_CONFIG_DOC}`);
  }
}

/**
 * Robustly fetches all historical orders from Firestore using pagination cursors
 * to ensure smooth handling of large collections.
 */
export async function fetchAllOrdersLedger(): Promise<Order[]> {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const allOrders: Order[] = [];
  let lastDoc = null;
  const BATCH_SIZE = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      let q = query(ordersRef, orderBy('createdAt', 'desc'), limit(BATCH_SIZE));
      if (lastDoc) {
        q = query(ordersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(BATCH_SIZE));
      }
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        hasMore = false;
      } else {
        snapshot.forEach((doc) => {
          allOrders.push(doc.data() as Order);
        });
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        if (snapshot.docs.length < BATCH_SIZE) {
          hasMore = false;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching paginated historical orders:", error);
    // Fallback to simpler load if cursor index is building or fails
    const snapshot = await getDocs(ordersRef);
    snapshot.forEach((doc) => {
      allOrders.push(doc.data() as Order);
    });
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return allOrders;
}

