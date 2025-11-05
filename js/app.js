// Shop UI & billing
(function(){
  const { getMenu, getSettings, saveOrders, getOrders, Store } = window.RamsStore;

  const els = {
    shopName: document.getElementById('shopName'),
    year: document.getElementById('year'),
    menuGrid: document.getElementById('menuGrid'),
    categoryTabs: Array.from(document.querySelectorAll('.category-tab')),
    cartItems: document.getElementById('cartItems'),
    subtotal: document.getElementById('subtotal'),
    total: document.getElementById('total'),
    cart: document.getElementById('cart'),
    cartToggle: document.getElementById('cartToggle'),
    toggleSum: document.getElementById('toggleSum'),
    payNowBtn: document.getElementById('payNowBtn'),
    printBtn: document.getElementById('printBtn'),
    clearBtn: document.getElementById('clearBtn'),
    payModal: document.getElementById('payModal'),
    closePayModal: document.getElementById('closePayModal'),
    paymentQr: document.getElementById('paymentQr'),
    payAmount: document.getElementById('payAmount'),
    copyAmount: document.getElementById('copyAmount'),
    receipt: document.getElementById('receipt'),
    receiptShopName: document.getElementById('receiptShopName'),
    receiptShopMeta: document.getElementById('receiptShopMeta'),
    receiptItems: document.getElementById('receiptItems'),
    receiptSubtotal: document.getElementById('receiptSubtotal'),
    receiptTax: document.getElementById('receiptTax'),
    receiptTotal: document.getElementById('receiptTotal'),
    receiptDate: document.getElementById('receiptDate'),
    receiptOrderId: document.getElementById('receiptOrderId'),
  };

  let settings = getSettings();
  let allMenu = getMenu();
  let activeCategory = 'All';
  let cart = []; // {id, name, price, qty}

  function money(n){ return `${settings.currency}${Number(n).toFixed(2)}`; }

  function placeholderFor(category, name){
    const q = encodeURIComponent(`${category||''} ${name||''}`.trim() || category || 'coffee');
    return `https://source.unsplash.com/600x400/?${q}`;
  }

  function syncHeader(){
    if(els.shopName) els.shopName.textContent = settings.shopName;
    if(els.year) els.year.textContent = new Date().getFullYear();
    if(els.paymentQr) els.paymentQr.src = settings.paymentQrImageUrl || 'assets/images/payment-qr.png';
  }

  function filteredMenu(){
    const list = allMenu.filter(m => m.available !== false);
    if(activeCategory === 'All') return list;
    return list.filter(m => m.category === activeCategory);
  }

  function renderMenu(){
    const list = filteredMenu();
    els.menuGrid.innerHTML = list.map(item => `
      <article class="card" role="button" tabindex="0" aria-label="Add ${item.name}" data-id="${item.id}">
        <img src="${item.imageUrl || placeholderFor(item.category, item.name)}" alt="${item.name}" />
        <div class="info">
          <div class="name">${item.name}</div>
          <div class="price">${money(item.price)}</div>
        </div>
      </article>
    `).join('');
  }


  function addToCart(item){
    const found = cart.find(c => c.id === item.id);
    if(found){ found.qty += 1; } else { cart.push({ id:item.id, name:item.name, price:item.price, qty:1 }); }
    renderCart();
  }

  function inc(id){ const it = cart.find(x=>x.id===id); if(it){ it.qty++; renderCart(); } }
  function dec(id){ const it = cart.find(x=>x.id===id); if(it){ it.qty=Math.max(0,it.qty-1); if(it.qty===0){ cart=cart.filter(x=>x.id!==id);} renderCart(); } }
  function removeItem(id){ cart = cart.filter(x=>x.id!==id); renderCart(); }
  function clearCart(){ cart=[]; renderCart(); }

  function totals(){
    const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
    const tax = 0; // tax removed
    const total = subtotal;
    return { subtotal, tax, total };
  }

  function renderCart(){
    els.cartItems.innerHTML = cart.length ? cart.map(i=>`
      <div class="cart-item">
        <div>${i.name}</div>
        <div class="qty">
          <button class="btn small" data-act="dec" data-id="${i.id}">-</button>
          <span>${i.qty}</span>
          <button class="btn small" data-act="inc" data-id="${i.id}">+</button>
        </div>
        <div>${money(i.price*i.qty)}</div>
        <button class="btn small danger" data-act="rm" data-id="${i.id}">Remove</button>
      </div>
    `).join('') : '<p class="muted">Cart is empty</p>';
    const t = totals();
    els.subtotal.textContent = money(t.subtotal);
    els.total.textContent = money(t.total);
    if(els.toggleSum) els.toggleSum.textContent = money(t.total);
  }

  function openPay(){
    const t = totals();
    if(t.total <= 0) return;
    els.payAmount.textContent = money(t.total);
    els.payModal.hidden = false;
  }
  function closePay(){ els.payModal.hidden = true; }

  function saveOrder(){
    const t = totals();
    const orders = getOrders();
    const orderId = Store.uid('order');
    orders.push({ id: orderId, items: cart.map(c=>({...c})), subtotal: t.subtotal, tax: t.tax, total: t.total, paidAtISO: new Date().toISOString() });
    saveOrders(orders);
    return orderId;
  }

  function renderReceipt(orderId){
    const t = totals();
    els.receiptShopName.textContent = settings.shopName;
    if(els.receiptShopMeta){
      const addr = settings.address ? `${settings.address}` : '';
      const phone = settings.phone ? ` | ${settings.phone}` : '';
      els.receiptShopMeta.textContent = `${addr}${phone}`.trim();
    }
    els.receiptItems.innerHTML = cart.map(i=>`<div class="row"><span>${i.name} x ${i.qty}</span><span>${money(i.price*i.qty)}</span></div>`).join('');
    els.receiptSubtotal.textContent = money(t.subtotal);
    els.receiptTotal.textContent = money(t.total);
    els.receiptDate.textContent = new Date().toLocaleString();
    els.receiptOrderId.textContent = orderId;
  }

  function printBill(){
    const t = totals();
    if(t.total <= 0) return;
    const orderId = saveOrder();
    renderReceipt(orderId);
    els.receipt.hidden = false;
    window.print();
    els.receipt.hidden = true;
    clearCart();
  }

  // Events
  els.categoryTabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      els.categoryTabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderMenu();
    });
  });

  els.menuGrid.addEventListener('click', (e)=>{
    const art = e.target.closest('article.card');
    if(!art) return;
    const id = art.dataset.id;
    const item = allMenu.find(x=>x.id===id);
    if(item) addToCart(item);
  });

  els.cartItems.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    if(act==='inc') inc(id);
    else if(act==='dec') dec(id);
    else if(act==='rm') removeItem(id);
  });

  els.clearBtn.addEventListener('click', ()=>{
    if(cart.length===0) return;
    if(confirm('Clear cart?')) clearCart();
  });

  els.payNowBtn.addEventListener('click', openPay);
  els.closePayModal.addEventListener('click', closePay);
  els.copyAmount.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(els.payAmount.textContent.replace(settings.currency,'')); alert('Amount copied'); }catch{}
  });
  els.printBtn.addEventListener('click', printBill);

  // Mobile cart toggle
  if(els.cartToggle && els.cart){
    els.cartToggle.addEventListener('click', ()=>{
      const isOpen = els.cart.classList.toggle('open');
      els.cartToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Init
  function init(){
    settings = getSettings();
    allMenu = getMenu();
    syncHeader();
    renderMenu();
    renderCart();
  }
  init();
})();


