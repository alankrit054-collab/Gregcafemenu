import { MenuItem } from './types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // HOT COFFEE
  {
    id: 'hc-espresso',
    name: 'Espresso',
    price: 215,
    category: 'hot_coffee',
    description: 'Rich, intense, and full-bodied double shot of espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1510707513156-46c24df93b5e?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-cortado',
    name: 'Cortado',
    price: 229,
    category: 'hot_coffee',
    description: 'Espresso cut with an equal amount of warm, silky milk.',
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-filter',
    name: 'Filter Coffee',
    price: 245,
    category: 'hot_coffee',
    description: 'Traditional slow-dripped single origin coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-frenchpress',
    name: 'French Press',
    price: 255,
    category: 'hot_coffee',
    description: 'Robust, full-flavor infusion brew served fresh.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-americano',
    name: 'Americano',
    price: 269,
    category: 'hot_coffee',
    description: 'Double espresso shots diluted with clean hot water.',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-cappuccino',
    name: 'Cappuccino',
    price: 289,
    category: 'hot_coffee',
    description: 'Equal parts espresso, steamed milk, and airy foam.',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-latte',
    name: 'Latte',
    price: 329,
    category: 'hot_coffee',
    description: 'Rich espresso balanced with velvety steamed milk.',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-spanishlatte',
    name: 'Spanish Latte',
    price: 329,
    category: 'hot_coffee',
    description: 'Sweetened milk combined with robust hot espresso shots.',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-vietnamese',
    name: 'Vietnamese Coffee',
    price: 335,
    category: 'hot_coffee',
    description: 'Strong, dark roast coffee over sweet condensed milk.',
    imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-maplecinnamon',
    name: 'Maple Cinnamon Latte',
    price: 349,
    category: 'hot_coffee',
    description: 'Warm, cozy blend of real maple syrup and ground cinnamon.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-mocha',
    name: 'Mocha',
    price: 355,
    category: 'hot_coffee',
    description: 'Espresso mixed with premium cocoa and steamed milk.',
    imageUrl: 'https://images.unsplash.com/photo-1589476993333-f55b84301219?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-darkmocha',
    name: 'Dark Chocolate Mocha',
    price: 365,
    category: 'hot_coffee',
    description: 'Deep, rich dark chocolate fudge combined with hot espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60',
    available: true
  },

  // ICED COFFEE
  {
    id: 'ic-americano',
    name: 'Iced Americano',
    price: 259,
    category: 'iced_coffee',
    description: 'Espresso shots over cold water and crisp ice.',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-ojespresso',
    name: 'OJ Espresso',
    price: 265,
    category: 'iced_coffee',
    description: 'Zesty fresh orange juice layered with a shot of espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-cappuccino',
    name: 'Iced Cappuccino',
    price: 289,
    category: 'iced_coffee',
    description: 'Chilled espresso and milk with a thick layer of cold foam.',
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-affogato',
    name: 'Affogato',
    price: 299,
    category: 'iced_coffee',
    description: 'A scoop of premium vanilla bean ice cream drowned in hot espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1594911774802-8822a707c9f7?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-espressoale',
    name: 'Espresso Ale',
    price: 299,
    category: 'iced_coffee',
    description: 'Carbonated sparkling espresso mocktail with premium bitters.',
    imageUrl: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-tonicespresso',
    name: 'Tonic Espresso',
    price: 299,
    category: 'iced_coffee',
    description: 'Fizzy tonic water poured over ice, finished with bold espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-butterscotch',
    name: 'Butterscotch Affogato',
    price: 329,
    category: 'iced_coffee',
    description: 'Vanilla ice cream and butterscotch syrup drowned in espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1594911774802-8822a707c9f7?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-classiccold',
    name: 'Classic Cold Coffee',
    price: 329,
    category: 'iced_coffee',
    description: 'Our signature blended sweet creamy cold coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-vietnamese-espresso',
    name: 'Iced Vietnamese (Espresso)',
    price: 335,
    category: 'iced_coffee',
    description: 'Bold espresso poured over sweet condensed milk and ice.',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-vietnamese-coldbrew',
    name: 'Iced Vietnamese (Cold Brew)',
    price: 335,
    category: 'iced_coffee',
    description: 'Smooth cold brew concentrated with sweet condensed milk.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-nutellaaffogato',
    name: 'Nutella Affogato',
    price: 339,
    category: 'iced_coffee',
    description: 'Espresso poured over rich vanilla gelato coated in warm Nutella.',
    imageUrl: 'https://images.unsplash.com/photo-1594911774802-8822a707c9f7?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-maplecinnamon',
    name: 'Iced Maple Cinnamon Latte',
    price: 349,
    category: 'iced_coffee',
    description: 'Chilled latte flavored with organic maple and cinnamon.',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-mocha',
    name: 'Iced Mocha',
    price: 355,
    category: 'iced_coffee',
    description: 'Cold milk, rich chocolate, and espresso poured over ice.',
    imageUrl: 'https://images.unsplash.com/photo-1589476993333-f55b84301219?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-toffeecold',
    name: 'Toffee Cold Coffee',
    price: 359,
    category: 'iced_coffee',
    description: 'Creamy cold coffee blended with rich English toffee crunch.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-chocfrappe',
    name: 'Chocolate Frappe',
    price: 359,
    category: 'iced_coffee',
    description: 'Rich, thick chocolate shake blended with premium espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-hazelnutfrappe',
    name: 'Hazelnut Frappe',
    price: 359,
    category: 'iced_coffee',
    description: 'Blended icy coffee with a distinct sweet toasted hazelnut flavor.',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-saltedcaramel',
    name: 'Salted Caramel Frappe',
    price: 359,
    category: 'iced_coffee',
    description: 'Rich buttery caramel blended with double espresso and sea salt.',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-darkmocha',
    name: 'Iced Dark Chocolate Mocha',
    price: 365,
    category: 'iced_coffee',
    description: 'Decadent dark chocolate combined with cold espresso and milk.',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'ic-seasaltamericano',
    name: 'Iced Sea Salt Americano',
    price: 399,
    category: 'iced_coffee',
    description: 'Our bold Americano topped with dense, savory sea salt cold foam.',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&auto=format&fit=crop&q=60',
    available: true
  },

  // COLD BREWS
  {
    id: 'cb-classic',
    name: 'Classic Cold Brew',
    price: 279,
    category: 'cold_brews',
    description: 'Steeped for 18 hours for maximum smoothness and low acidity.',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'cb-citrus',
    name: 'Citrus Cold Brew',
    price: 279,
    category: 'cold_brews',
    description: 'Refreshing classic cold brew layered with zesty fresh citrus.',
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'cb-watermelon',
    name: 'Watermelon Cold Brew',
    price: 299,
    category: 'cold_brews',
    description: 'Unexpectedly crisp and refreshing combination of fruit and coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'cb-cranberry',
    name: 'Cranberry Cold Brew',
    price: 305,
    category: 'cold_brews',
    description: 'Tangy and sweet cranberry juice shaken with cold brew coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&auto=format&fit=crop&q=60',
    available: true
  },

  // HOT CHOCOLATE
  {
    id: 'hc-classic',
    name: 'Classic Hot Chocolate',
    price: 329,
    category: 'hot_chocolate',
    description: 'Pure melted premium chocolate and steamed organic milk.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-nutella',
    name: 'Nutella Hot Chocolate',
    price: 359,
    category: 'hot_chocolate',
    description: 'Rich hazelnut cocoa topped with roasted hazelnut shavings.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-oreo',
    name: 'Oreo Hot Chocolate',
    price: 359,
    category: 'hot_chocolate',
    description: 'Sweet, creamy hot cocoa loaded with crushed Oreos.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'hc-mexican',
    name: 'Mexican Hot Chocolate',
    price: 359,
    category: 'hot_chocolate',
    description: 'Comforting cocoa spiced with cinnamon and a hint of cayenne.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&auto=format&fit=crop&q=60',
    available: true
  },

  // TEA
  {
    id: 't-masala',
    name: 'Masala Chai',
    price: 235,
    category: 'tea',
    description: 'Fragrant tea infused with warm cardamoms, cinnamon, and cloves.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 't-tulsi',
    name: 'Tulsi Green Tea',
    price: 305,
    category: 'tea',
    description: 'Refreshing organic green tea leaves blended with holy basil.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 't-vanilla',
    name: 'Vanilla, Rose & Ginger',
    price: 305,
    category: 'tea',
    description: 'Beautifully aromatic infusion of sweet rose buds, warm ginger, and vanilla.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 't-alpine',
    name: 'Alpine Wildberry',
    price: 309,
    category: 'tea',
    description: 'Tart and delicious blend of hibiscus, elderberries, and wild rosehips.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 't-earlgrey',
    name: 'Earl Grey',
    price: 309,
    category: 'tea',
    description: 'Classic black tea flavored with elegant oil of bergamot.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 't-minty',
    name: 'Minty Hibiscus',
    price: 309,
    category: 'tea',
    description: 'A vibrant herbal blend of sweet hibiscus flowers and fresh garden mint.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 't-gregs',
    name: "Greg's Blend",
    price: 359,
    category: 'tea',
    description: 'Our secret premium house tea blend. Cozy, balanced, and comforting.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    available: true
  },

  // MATCHA
  {
    id: 'm-latte',
    name: 'Matcha Latte',
    price: 399,
    category: 'matcha',
    description: 'Premium grade Japanese stone-ground matcha with steamed milk.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'm-icedcranberry',
    name: 'Iced Cranberry Matcha',
    price: 399,
    category: 'matcha',
    description: 'A stunning layered drink of tart cranberry juice and vibrant green matcha.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'm-vanilla',
    name: 'Matcha Vanilla Affogato',
    price: 399,
    category: 'matcha',
    description: 'Matcha whisked beautifully, poured over premium vanilla bean gelato.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=150&auto=format&fit=crop&q=60',
    available: true
  },
  {
    id: 'm-strawberry',
    name: 'Strawberry Matcha',
    price: 399,
    category: 'matcha',
    description: 'Layered milk, hand-whisked matcha, and fresh homemade strawberry puree.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=150&auto=format&fit=crop&q=60',
    available: true
  }
];

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'hot_coffee', label: 'Hot Coffee' },
  { key: 'iced_coffee', label: 'Iced Coffee' },
  { key: 'cold_brews', label: 'Cold Brews' },
  { key: 'hot_chocolate', label: 'Hot Chocolate' },
  { key: 'tea', label: 'Tea' },
  { key: 'matcha', label: 'Matcha' }
];
