// Admin: CRUD, settings, reports
(function(){
  const { getMenu, saveMenu, getSettings, saveSettings, getOrders, Store } = window.RamsStore;

  const els = {
    year: document.getElementById('year'),
    search: document.getElementById('search'),
    filterCategory: document.getElementById('filterCategory'),
    newItemBtn: document.getElementById('newItemBtn'),
    menuTable: document.getElementById('menuTable'),
    itemModal: document.getElementById('itemModal'),
    closeItemModal: document.getElementById('closeItemModal'),
    itemTitle: document.getElementById('itemTitle'),
    itemForm: document.getElementById('itemForm'),
    itemName: document.getElementById('itemName'),
    itemCategory: document.getElementById('itemCategory'),
    itemPrice: document.getElementById('itemPrice'),
    itemImage: document.getElementById('itemImage'),
    suggestImage: document.getElementById('suggestImage'),
    itemAvailable: document.getElementById('itemAvailable'),
    settingsForm: document.getElementById('settingsForm'),
    shopNameInput: document.getElementById('shopNameInput'),
    addressInput: document.getElementById('addressInput'),
    phoneInput: document.getElementById('phoneInput'),
    currencyInput: document.getElementById('currencyInput'),
    qrInput: document.getElementById('qrInput'),
    reportMonth: document.getElementById('reportMonth'),
    runReport: document.getElementById('runReport'),
    exportCsv: document.getElementById('exportCsv'),
    reportSummary: document.getElementById('reportSummary'),
    reportTopItems: document.getElementById('reportTopItems'),
    reportDate: document.getElementById('reportDate'),
    runDailyReport: document.getElementById('runDailyReport'),
    exportDailyCsv: document.getElementById('exportDailyCsv'),
    dailySummary: document.getElementById('dailySummary'),
    dailyTopItems: document.getElementById('dailyTopItems'),
  };

  let items = getMenu();
  let settings = getSettings();
  let editingId = null;

  function fmt(n){ return `${settings.currency}${Number(n).toFixed(2)}`; }

  function renderTable(){
    const q = (els.search.value||'').toLowerCase();
    const cat = els.filterCategory.value||'';
    const filtered = items.filter(i => (!cat || i.category===cat) && (!q || i.name.toLowerCase().includes(q)));
    const head = `<div class="tr" aria-hidden="true" style="opacity:.7"><strong>Image</strong><strong>Name</strong><strong>Category</strong><strong>Price</strong><strong>Avail</strong><strong>Actions</strong></div>`;
    const rows = filtered.map(i=>`
      <div class="tr" data-id="${i.id}">
        <div><img class="thumb" src="${i.imageUrl || placeholderForCategory(i.category)}" alt="${i.name}"/></div>
        <div>${i.name}</div>
        <div>${i.category}</div>
        <div>${fmt(i.price)}</div>
        <div>${i.available!==false ? 'Yes' : 'No'}</div>
        <div>
          <button class="btn small" data-act="edit">Edit</button>
          <button class="btn small danger" data-act="del">Delete</button>
        </div>
      </div>
    `).join('');
    els.menuTable.innerHTML = head + rows;
  }

  function openModal(item){
    els.itemTitle.textContent = item ? 'Edit Item' : 'New Item';
    editingId = item ? item.id : null;
    els.itemName.value = item?.name || '';
    els.itemCategory.value = item?.category || 'Tea';
    els.itemPrice.value = item?.price ?? '';
    els.itemImage.value = item?.imageUrl || '';
    els.itemAvailable.checked = item?.available !== false;
    els.itemModal.hidden = false;
  }
  function closeModal(){ els.itemModal.hidden = true; }

  function saveItemFromForm(e){
    e.preventDefault();
    const payload = {
      id: editingId || Store.uid('item'),
      name: els.itemName.value.trim(),
      category: els.itemCategory.value,
      price: Number(els.itemPrice.value||0),
      imageUrl: els.itemImage.value.trim() || placeholderForCategory(els.itemCategory.value),
      available: !!els.itemAvailable.checked
    };
    if(editingId){
      items = items.map(i => i.id===editingId ? payload : i);
    } else {
      items.push(payload);
    }
    saveMenu(items);
    renderTable();
    closeModal();
  }

  function placeholderForCategory(cat){
    if(cat==='Tea') return 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop';
    if(cat==='Coffee') return 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop';
    if(cat==='Fresh Juice') return 'https://images.unsplash.com/photo-1542444459-db63c3884b52?q=80&w=800&auto=format&fit=crop';
    if(cat==='Snacks') return 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop';
    if(cat==='Herbal Soups') return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800&auto=format&fit=crop';
  }

  els.menuTable.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const row = btn.closest('.tr');
    const id = row?.dataset.id;
    const act = btn.dataset.act;
    if(act==='edit'){
      const item = items.find(i=>i.id===id);
      if(item) openModal(item);
    } else if(act==='del'){
      if(confirm('Delete this item?')){
        items = items.filter(i=>i.id!==id);
        saveMenu(items);
        renderTable();
      }
    }
  });

  els.newItemBtn.addEventListener('click', ()=> openModal(null));
  els.closeItemModal.addEventListener('click', closeModal);
  els.itemForm.addEventListener('submit', saveItemFromForm);
  els.search.addEventListener('input', renderTable);
  els.filterCategory.addEventListener('change', renderTable);
  els.suggestImage.addEventListener('click', ()=>{
    const name = (els.itemName.value||'').trim();
    const category = els.itemCategory.value||'';
    const query = encodeURIComponent(`${category} ${name}`.trim() || category || 'coffee shop');
    const url = `https://source.unsplash.com/600x400/?${query}`;
    els.itemImage.value = url;
  });

  // Settings
  function renderSettings(){
    els.shopNameInput.value = settings.shopName || 'Rams Coffee Shop';
    els.addressInput.value = settings.address || 'Main Street, Your City';
    els.phoneInput.value = settings.phone || '+91 90000 00000';
    els.currencyInput.value = settings.currency || '\u20B9';
    els.qrInput.value = settings.paymentQrImageUrl || 'assets/images/payment-qr.png';
  }
  els.settingsForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    settings = {
      shopName: els.shopNameInput.value.trim() || 'Rams Coffee Shop',
      address: els.addressInput.value.trim() || 'Main Street, Your City',
      phone: els.phoneInput.value.trim() || '+91 90000 00000',
      currency: els.currencyInput.value.trim() || '\u20B9',
      paymentQrImageUrl: els.qrInput.value.trim() || 'assets/images/payment-qr.png'
    };
    saveSettings(settings);
    alert('Settings saved');
  });

  // Reports
  function runReport(){
    const month = els.reportMonth.value; // yyyy-mm
    const orders = getOrders();
    const filtered = month ? orders.filter(o => (o.paidAtISO||'').startsWith(month)) : orders;
    const ordersCount = filtered.length;
    const gross = filtered.reduce((s,o)=> s + (Number(o.subtotal)||0), 0);
    const net = filtered.reduce((s,o)=> s + (Number(o.total)||0), 0);
    els.reportSummary.innerHTML = `
      <div class="row"><span>Orders</span><span>${ordersCount}</span></div>
      <div class="row"><span>Gross</span><span>${fmt(gross)}</span></div>
      <div class="row total"><span>Net</span><span>${fmt(net)}</span></div>
    `;

    const itemMap = new Map();
    filtered.forEach(o => {
      (o.items||[]).forEach(it => {
        const prev = itemMap.get(it.name) || { qty:0, revenue:0 };
        prev.qty += it.qty;
        prev.revenue += it.price * it.qty;
        itemMap.set(it.name, prev);
      });
    });
    const top = Array.from(itemMap.entries()).sort((a,b)=> b[1].revenue - a[1].revenue).slice(0,10);
    els.reportTopItems.innerHTML = top.map(([name,stats])=>`<div class="row"><span>${name} (${stats.qty})</span><span>${fmt(stats.revenue)}</span></div>`).join('') || '<p class="muted">No data</p>';

    return { month, orders: filtered, totals: { ordersCount, gross, tax, net }, top };
  }

  function exportCsv(){
    const { month, orders } = runReport();
    const rows = [['OrderId','Date','Item','Qty','Price','Subtotal','Total']];
    orders.forEach(o => {
      (o.items||[]).forEach(it => {
        rows.push([o.id, o.paidAtISO, it.name, it.qty, it.price, o.subtotal, o.total]);
      });
    });
    const csv = rows.map(r => r.map(v => String(v).replaceAll('"','""')).map(v=>`"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rams-report-${month||'all'}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  els.runReport.addEventListener('click', runReport);
  els.exportCsv.addEventListener('click', exportCsv);

  // Daily report
  function runDaily(){
    const dateStr = els.reportDate.value || new Date().toISOString().slice(0,10); // yyyy-mm-dd
    const orders = getOrders();
    const filtered = orders.filter(o => (o.paidAtISO||'').slice(0,10) === dateStr);
    const ordersCount = filtered.length;
    const gross = filtered.reduce((s,o)=> s + (Number(o.subtotal)||0), 0);
    const net = filtered.reduce((s,o)=> s + (Number(o.total)||0), 0);
    els.dailySummary.innerHTML = `
      <div class="row"><span>Orders</span><span>${ordersCount}</span></div>
      <div class="row"><span>Gross</span><span>${fmt(gross)}</span></div>
      <div class="row total"><span>Net</span><span>${fmt(net)}</span></div>
    `;

    const itemMap = new Map();
    filtered.forEach(o => {
      (o.items||[]).forEach(it => {
        const prev = itemMap.get(it.name) || { qty:0, revenue:0 };
        prev.qty += it.qty;
        prev.revenue += it.price * it.qty;
        itemMap.set(it.name, prev);
      });
    });
    const top = Array.from(itemMap.entries()).sort((a,b)=> b[1].revenue - a[1].revenue).slice(0,10);
    els.dailyTopItems.innerHTML = top.map(([name,stats])=>`<div class="row"><span>${name} (${stats.qty})</span><span>${fmt(stats.revenue)}</span></div>`).join('') || '<p class="muted">No data</p>';

    return { date: dateStr, orders: filtered, totals: { ordersCount, gross, net }, top };
  }

  function exportDaily(){
    const { date, orders } = runDaily();
    const rows = [['OrderId','Date','Item','Qty','Price','Subtotal','Total']];
    orders.forEach(o => {
      (o.items||[]).forEach(it => {
        rows.push([o.id, o.paidAtISO, it.name, it.qty, it.price, o.subtotal, o.total]);
      });
    });
    const csv = rows.map(r => r.map(v => String(v).replaceAll('"','""')).map(v=>`"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rams-report-day-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  els.runDailyReport.addEventListener('click', runDaily);
  els.exportDailyCsv.addEventListener('click', exportDaily);

  function init(){
    if(els.year) els.year.textContent = new Date().getFullYear();
    items = getMenu();
    settings = getSettings();
    renderTable();
    renderSettings();
  }
  init();
})();


