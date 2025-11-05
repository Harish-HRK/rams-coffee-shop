// Storage helpers and seed data
(function(){
  const KEYS = {
    menu: 'rams.menu',
    orders: 'rams.orders',
    settings: 'rams.settings'
  };

  const Store = {
    get(key, fallback){
      try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch{ return fallback; }
    },
    set(key, value){ localStorage.setItem(key, JSON.stringify(value)); },
    remove(key){ localStorage.removeItem(key); },
    uid(prefix='id'){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
  };

  function seedIfNeeded(){
    const existingMenu = Store.get(KEYS.menu, null);
    if(!existingMenu){
      const menu = [
        { id: Store.uid('item'), name: 'Masala Tea', price: 25, category: 'Tea', imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Ginger Tea', price: 30, category: 'Tea', imageUrl: 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Espresso', price: 60, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Cappuccino', price: 90, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1503481766315-7a586b20f66f?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Cold Coffee', price: 80, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Orange Juice', price: 70, category: 'Fresh Juice', imageUrl: 'https://images.unsplash.com/photo-1542444459-db63c3884b52?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Watermelon Juice', price: 65, category: 'Fresh Juice', imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Samosa', price: 20, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454f?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Veg Sandwich', price: 50, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Herbal Mushroom Soup', price: 85, category: 'Herbal Soups', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Herbal Lemon Soup', price: 75, category: 'Herbal Soups', imageUrl: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Vanilla Ice Cream', price: 60, category: 'Ice Cream', imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&auto=format&fit=crop', available: true },
        { id: Store.uid('item'), name: 'Chocolate Ice Cream', price: 70, category: 'Ice Cream', imageUrl: 'https://images.unsplash.com/photo-1505253216365-9d44e8a12ca4?q=80&w=800&auto=format&fit=crop', available: true },
      ];
      Store.set(KEYS.menu, menu);
    }

    const settings = Store.get(KEYS.settings, null) || {
      shopName: 'Rams Coffee Shop',
      address: 'Main Street, Your City',
      phone: '+91 90000 00000',
      currency: '\u20B9',
      paymentQrImageUrl: 'assets/images/payment-qr.png'
    };
    Store.set(KEYS.settings, settings);

    if(!Store.get(KEYS.orders, null)){
      Store.set(KEYS.orders, []);
    }
  }

  function getSettings(){ return Store.get(KEYS.settings, { shopName:'Rams Coffee Shop', address:'Main Street, Your City', phone:'+91 90000 00000', currency:'\u20B9', paymentQrImageUrl:'assets/images/payment-qr.png' }); }
  function saveSettings(next){ Store.set(KEYS.settings, next); }

  function getMenu(){ return Store.get(KEYS.menu, []); }
  function saveMenu(list){ Store.set(KEYS.menu, list); }

  function getOrders(){ return Store.get(KEYS.orders, []); }
  function saveOrders(orders){ Store.set(KEYS.orders, orders); }

  // Expose minimal API
  window.RamsStore = {
    KEYS, Store,
    seedIfNeeded,
    getSettings, saveSettings,
    getMenu, saveMenu,
    getOrders, saveOrders
  };

  // auto-seed on load
  seedIfNeeded();
})();


