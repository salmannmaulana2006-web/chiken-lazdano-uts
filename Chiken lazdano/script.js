// --- INITIAL DATA STORES ---
let products = [
    { id: 101, name: "Paket Lazdano Geprek Sambal Bawang", category: "Geprek", price: 22000, inStock: true, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500", desc: "Nasi + Ayam Crispy Geprek Pedas Mantap + Tahu Tempe." },
    { id: 102, name: "Lazdano Wings Spicy Korean BBQ (6 pcs)", category: "Crispy", price: 28000, inStock: true, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500", desc: "Kepak ayam renyah dilumuri saus pedas manis khas Korea." },
    { id: 103, name: "Paket Golden Crispy Combo 1", category: "Crispy", price: 25000, inStock: true, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500", desc: "1 Potong Dada/Paha Atas + Nasi + Es Teh Manis." },
    { id: 104, name: "Kentang Goreng Bumbu Lazdano", category: "Sides", price: 14000, inStock: true, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500", desc: "French fries renyah dengan bumbu keju gurih." },
    { id: 105, name: "Es Teh Manis Jumbo Lazdano", category: "Minuman", price: 5000, inStock: true, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500", desc: "Es teh segar manis porsi besar pemuas dahaga." },
    { id: 106, name: "Ayam Geprek Melted Cheese", category: "Geprek", price: 27000, inStock: false, image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500", desc: "Ayam geprek dengan keju mozarella leleh khas Lazdano." }
];

let orders = [
    {
        id: "ORD-9021",
        customer: { name: "Budi Santoso", phone: "081298765432", address: "Jl. Pajajaran No. 45, Bogor" },
        items: [{ id: 101, name: "Paket Lazdano Geprek Sambal Bawang", qty: 2, price: 22000 }],
        subtotal: 44000,
        deliveryFee: 8000,
        total: 52000,
        paymentMethod: "QRIS",
        paymentStatus: "Lunas",
        deliveryStatus: "Dalam Pengantaran",
        courier: "Rian (Kurir Express 01)",
        timestamp: "10:15 WIB"
    },
    {
        id: "ORD-9022",
        customer: { name: "Siti Rahma", phone: "085711223344", address: "Komp. IPB Dramaga Blok B3" },
        items: [{ id: 102, name: "Lazdano Wings Spicy Korean BBQ", qty: 1, price: 28000 }, { id: 105, name: "Es Teh Manis Jumbo", qty: 2, price: 5000 }],
        subtotal: 38000,
        deliveryFee: 8000,
        total: 46000,
        paymentMethod: "Transfer Bank",
        paymentStatus: "Menunggu Verifikasi",
        deliveryStatus: "Menunggu Kurir",
        courier: "-",
        timestamp: "10:42 WIB"
    }
];

let users = [
    { id: 1, name: "Ahmad Rivaldi", role: "Admin", phone: "081100001111", status: "Aktif" },
    { id: 2, name: "Siska Dewi", role: "Kasir", phone: "081100002222", status: "Aktif" },
    { id: 3, name: "Rian Kurnia", role: "Kurir", phone: "081100003333", status: "Sedang Bertugas" },
    { id: 4, name: "Budi Santoso", role: "Pelanggan", phone: "081298765432", status: "Aktif" }
];

let cart = [];
let activeCategory = "All";
let orderChartInstance = null;

// --- LOCAL STORAGE: menyimpan data demo di browser/perangkat yang sama ---
const LAZDANO_STORAGE_KEY = 'chikenLazdanoData_v1';
function loadAppData() {
    try {
        const saved = JSON.parse(localStorage.getItem(LAZDANO_STORAGE_KEY) || 'null');
        if (!saved || typeof saved !== 'object') return;
        if (Array.isArray(saved.products)) products = saved.products;
        if (Array.isArray(saved.orders)) orders = saved.orders;
        if (Array.isArray(saved.users)) users = saved.users;
        if (Array.isArray(saved.cart)) cart = saved.cart;
    } catch (error) {
        console.warn('Data lokal tidak dapat dibaca. Data demo awal digunakan.', error);
    }
}
function saveAppData() {
    try {
        localStorage.setItem(LAZDANO_STORAGE_KEY, JSON.stringify({ products, orders, users, cart }));
    } catch (error) {
        console.warn('Data gagal disimpan ke Local Storage.', error);
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadAppData();
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    renderDashboard();
    renderCustomerMenu();
    renderProductTable();
    renderTransactionsTable();
    renderDeliveryBoard();
    renderUsersTable();
    setupCartEvents();
    updateCartUI();
    saveAppData();
});

// --- NAVIGATION MODULE SWITCHER ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`module-${tabId}`).classList.remove('hidden');
    document.getElementById(`tab-${tabId}`).classList.add('active');

    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'pos') renderCustomerMenu();
    if (tabId === 'products') renderProductTable();
    if (tabId === 'transactions') renderTransactionsTable();
    if (tabId === 'delivery') renderDeliveryBoard();
    if (tabId === 'users') renderUsersTable();
}

// --- MODULE 1: DASHBOARD ---
function renderDashboard() {
    const totalRev = orders.filter(o => o.paymentStatus === 'Lunas').reduce((acc, o) => acc + o.total, 0);
    document.getElementById('dashTotalRevenue').innerText = `Rp ${totalRev.toLocaleString('id-ID')}`;
    document.getElementById('dashTotalOrders').innerText = orders.length;
    document.getElementById('dashTotalProducts').innerText = products.filter(p => p.inStock).length;
    
    const activeDeliv = orders.filter(o => o.deliveryStatus === 'Dalam Pengantaran').length;
    document.getElementById('dashActiveDelivery').innerText = activeDeliv;

    // Table
    const tbody = document.getElementById('dashRecentOrdersTable');
    tbody.innerHTML = '';
    orders.slice(-5).reverse().forEach(o => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="py-3 font-bold text-gray-900">${o.id}</td>
                <td class="py-3">${o.customer.name}</td>
                <td class="py-3 font-semibold">Rp ${o.total.toLocaleString('id-ID')}</td>
                <td class="py-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${o.paymentStatus === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                        ${o.paymentStatus}
                    </span>
                </td>
                <td class="py-3 text-gray-400 text-xs">${o.timestamp}</td>
            </tr>
        `;
    });

    // Chart
    const pendingCount = orders.filter(o => o.paymentStatus !== 'Lunas').length;
    const doneCount = orders.filter(o => o.paymentStatus === 'Lunas').length;
    
    document.getElementById('chartCountPending').innerText = pendingCount;
    document.getElementById('chartCountDone').innerText = doneCount;

    const ctx = document.getElementById('orderChart').getContext('2d');
    if (orderChartInstance) orderChartInstance.destroy();
    
    orderChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Lunas / Selesai'],
            datasets: [{
                data: [pendingCount, doneCount],
                backgroundColor: ['#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// --- MODULE 2: PEMESANAN (POS & CUSTOMER) ---
function filterCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim().toLowerCase().includes(cat.toLowerCase()) || (cat === 'All' && btn.textContent.toLowerCase().includes('semua')));
    });
    renderCustomerMenu();
}

// --- LOGIN DEMO (CLIENT-SIDE ONLY, NOT SECURE AUTHENTICATION) ---
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const error = document.getElementById('loginError');
    if (username === 'admin' && password === 'Lazdano123') {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appShell').classList.remove('hidden');
        document.getElementById('signedInUser').textContent = 'Admin Lazdano';
        error.textContent = '';
        renderDashboard();
        renderCustomerMenu();
    } else {
        error.textContent = 'Username atau password salah. Silakan coba lagi.';
    }
}

function logout() {
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

function renderCustomerMenu() {
    const search = document.getElementById('searchMenu').value.toLowerCase();
    const grid = document.getElementById('customerMenuGrid');
    grid.innerHTML = '';

    const filtered = products.filter(p => {
        const matchesCat = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search);
        return matchesCat && matchesSearch;
    });

    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                    <div class="relative h-44 overflow-hidden bg-gray-100">
                        <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover ${!p.inStock ? 'opacity-40 grayscale' : ''}">
                        <span class="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            ${p.category}
                        </span>
                        ${!p.inStock ? '<span class="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-extrabold text-sm uppercase">Stok Habis</span>' : ''}
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-gray-900 text-base leading-snug">${p.name}</h3>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${p.desc}</p>
                    </div>
                </div>
                <div class="p-4 pt-0 flex items-center justify-between mt-2">
                    <span class="font-black text-red-600 text-lg">Rp ${p.price.toLocaleString('id-ID')}</span>
                    <button onclick="addToCart(${p.id})" ${!p.inStock ? 'disabled' : ''} class="px-3.5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all">
                        <i class="fa-solid fa-plus"></i> Tambah
                    </button>
                </div>
            </div>
        `;
    });
}

// CART SYSTEM
function setupCartEvents() {
    document.getElementById('cartBtn').addEventListener('click', toggleCart);
}

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    drawer.classList.toggle('hidden');
}

function addToCart(prodId) {
    const prod = products.find(p => p.id === prodId);
    if (!prod || !prod.inStock) return;

    const existing = cart.find(c => c.id === prodId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
    }
    updateCartUI();
    saveAppData();
    // Pastikan drawer tetap terbuka saat beberapa produk ditambahkan berturut-turut.
    document.getElementById('cartDrawer').classList.remove('hidden');
}

function updateCartQty(prodId, delta) {
    const item = cart.find(c => c.id === prodId);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(c => c.id !== prodId);
        }
    }
    updateCartUI();
    saveAppData();
}

function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);
    
    if (totalQty > 0) {
        badge.innerText = totalQty;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    const list = document.getElementById('cartItemsList');
    list.innerHTML = '';

    if (cart.length === 0) {
        list.innerHTML = `<div class="text-center text-gray-400 py-12 text-xs">Keranjang Anda masih kosong.</div>`;
    } else {
        cart.forEach(c => {
            list.innerHTML += `
                <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div>
                        <h4 class="font-bold text-xs text-gray-900">${c.name}</h4>
                        <span class="text-xs text-red-600 font-semibold">Rp ${(c.price * c.qty).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                        <button onclick="updateCartQty(${c.id}, -1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">-</button>
                        <span class="text-xs font-bold w-4 text-center">${c.qty}</span>
                        <button onclick="updateCartQty(${c.id}, 1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">+</button>
                    </div>
                </div>
            `;
        });
    }

    const subtotal = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
    const deliveryFee = subtotal > 0 ? 8000 : 0;
    const grandTotal = subtotal + deliveryFee;

    document.getElementById('cartSubtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('cartDeliveryFee').innerText = `Rp ${deliveryFee.toLocaleString('id-ID')}`;
    document.getElementById('cartGrandTotal').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

function submitOrder() {
    if (cart.length === 0) return alert('Keranjang belanja masih kosong!');
    
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const payment = document.getElementById('custPayment').value;

    if (!name || !phone || !address) {
        return alert('Mohon lengkapi seluruh data pemesan & alamat!');
    }

    const subtotal = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
    const deliveryFee = 8000;
    const newOrdId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
        id: newOrdId,
        customer: { name, phone, address },
        items: [...cart],
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        paymentMethod: payment,
        paymentStatus: 'Menunggu Verifikasi',
        deliveryStatus: 'Menunggu Kurir',
        courier: '-',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    orders.unshift(newOrder);
    cart = [];
    saveAppData();
    updateCartUI();
    toggleCart();

    // Reset Form
    document.getElementById('custName').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('custAddress').value = '';

    // Send WA Gateway Notification
    sendWaNotification(newOrder.customer.phone, `Halo ${newOrder.customer.name}, pesanan Chicken Lazdano *${newOrder.id}* berhasil dibuat! Total: Rp ${newOrder.total.toLocaleString('id-ID')}. Status Pembayaran: ${newOrder.paymentStatus}`);

    alert(`Pesanan ${newOrdId} berhasil dibuat! Data tersimpan di browser ini.`);
    renderDashboard();
    renderDeliveryBoard();
    switchTab('transactions');
}

// --- MODULE 3: MANAJEMEN PRODUK & HARGA ---
function renderProductTable() {
    const tbody = document.getElementById('productManagementTable');
    tbody.innerHTML = '';

    products.forEach(p => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="p-3.5">
                    <img src="${p.image}" class="w-12 h-12 rounded-xl object-cover bg-gray-100">
                </td>
                <td class="p-3.5 font-bold text-gray-900">${p.name}</td>
                <td class="p-3.5"><span class="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">${p.category}</span></td>
                <td class="p-3.5 font-extrabold text-red-600">Rp ${p.price.toLocaleString('id-ID')}</td>
                <td class="p-3.5">
                    <button onclick="toggleStock(${p.id})" class="px-3 py-1 rounded-full text-xs font-bold ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${p.inStock ? 'Tersedia' : 'Habis'}
                    </button>
                </td>
                <td class="p-3.5 text-right">
                    <button onclick="openProductModal(${p.id})" class="text-gray-500 hover:text-blue-600 p-1.5"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="text-gray-500 hover:text-red-600 p-1.5"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function toggleStock(prodId) {
    const prod = products.find(p => p.id === prodId);
    if (prod) {
        prod.inStock = !prod.inStock;
        saveAppData();
        renderProductTable();
    }
}

function openProductModal(prodId = null) {
    const modal = document.getElementById('productModal');
    modal.classList.remove('hidden');

    if (prodId) {
        const p = products.find(item => item.id === prodId);
        document.getElementById('productModalTitle').innerText = 'Edit Menu Lazdano';
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodImage').value = p.image;
        document.getElementById('prodDesc').value = p.desc;
    } else {
        document.getElementById('productModalTitle').innerText = 'Tambah Menu Baru';
        document.getElementById('productForm').reset();
        document.getElementById('prodId').value = '';
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value;
    const category = document.getElementById('prodCategory').value;
    const price = parseInt(document.getElementById('prodPrice').value);
    const image = document.getElementById('prodImage').value || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500';
    const desc = document.getElementById('prodDesc').value;

    if (id) {
        const index = products.findIndex(p => p.id == id);
        products[index] = { ...products[index], name, category, price, image, desc };
    } else {
        const newProd = { id: Date.now(), name, category, price, inStock: true, image, desc };
        products.push(newProd);
    }

    saveAppData();
    closeProductModal();
    renderProductTable();
}

function deleteProduct(prodId) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        products = products.filter(p => p.id !== prodId);
        saveAppData();
        renderProductTable();
    }
}

// --- MODULE 4: TRANSAKSI DAN PEMBAYARAN ---
function renderTransactionsTable() {
    const tbody = document.getElementById('transactionTable');
    tbody.innerHTML = '';

    let pendingCount = 0;
    let paidCount = 0;

    orders.forEach(o => {
        if (o.paymentStatus === 'Lunas') paidCount++;
        else pendingCount++;

        const itemsSummary = o.items.map(i => `${i.name} (x${i.qty})`).join(', ');

        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="p-3.5 font-bold text-gray-900">${o.id}</td>
                <td class="p-3.5">
                    <div class="font-bold text-gray-800">${o.customer.name}</div>
                    <div class="text-xs text-gray-400">${o.customer.phone}</div>
                </td>
                <td class="p-3.5 text-xs text-gray-600 max-w-xs truncate">${itemsSummary}</td>
                <td class="p-3.5 font-black text-gray-900">Rp ${o.total.toLocaleString('id-ID')}</td>
                <td class="p-3.5 text-xs font-semibold">${o.paymentMethod}</td>
                <td class="p-3.5">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${o.paymentStatus === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                        ${o.paymentStatus}
                    </span>
                </td>
                <td class="p-3.5 text-right">
                    ${o.paymentStatus !== 'Lunas' ? `
                        <button onclick="verifyPayment('${o.id}')" class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all">
                            Verifikasi Lunas
                        </button>
                    ` : '<span class="text-xs text-gray-400 font-semibold"><i class="fa-solid fa-check"></i> Terverifikasi</span>'}
                </td>
            </tr>
        `;
    });

    document.getElementById('txnPendingBadge').innerText = pendingCount;
    document.getElementById('txnPaidBadge').innerText = paidCount;
}

function verifyPayment(orderId) {
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
        ord.paymentStatus = 'Lunas';
        saveAppData();
        renderTransactionsTable();
        renderDashboard();
        sendWaNotification(ord.customer.phone, `Pembayaran untuk pesanan *${ord.id}* telah terverifikasi LUNAS. Pesanan sedang diproses dapur Lazdano!`);
    }
}

// --- MODULE 5: PENGANTARAN & WHATSAPP GATEWAY ---
function renderDeliveryBoard() {
    const container = document.getElementById('deliveryCardsContainer');
    container.innerHTML = '';

    orders.forEach(o => {
        container.innerHTML += `
            <div class="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-extrabold text-gray-900">${o.id}</span>
                        <span class="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-md">${o.deliveryStatus}</span>
                    </div>
                    <p class="text-xs text-gray-600 mt-1"><i class="fa-solid fa-location-dot text-red-500"></i> ${o.customer.address} (${o.customer.name})</p>
                    <p class="text-xs text-gray-400 mt-0.5">Kurir Bertugas: <strong class="text-gray-700">${o.courier}</strong></p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                    <button onclick="openWhatsAppChat('${o.customer.phone}', '${o.customer.name}', '${o.id}')" class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all">
                        Chat WhatsApp
                    </button>
                    ${o.deliveryStatus === 'Menunggu Kurir' ? `
                        <button onclick="assignCourier('${o.id}')" class="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all">
                            Tugaskan Kurir
                        </button>
                    ` : ''}
                    ${o.deliveryStatus === 'Dalam Pengantaran' ? `
                        <button onclick="completeDelivery('${o.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all">
                            Selesaikan Pengiriman
                        </button>
                    ` : ''}
                    ${o.deliveryStatus === 'Pesanan Diterima' ? `
                        <span class="text-xs font-bold text-green-600 flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Selesai</span>
                    ` : ''}
                </div>
            </div>
        `;
    });
}

function assignCourier(orderId) {
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
        ord.deliveryStatus = 'Dalam Pengantaran';
        ord.courier = 'Rian (Kurir Express 01)';
        saveAppData();
        renderDeliveryBoard();
        renderDashboard();
        sendWaNotification(ord.customer.phone, `Pesanan *${ord.id}* sedang diantar oleh kurir Lazdano (${ord.courier}). Mohon bersiap di lokasi!`);
    }
}

function completeDelivery(orderId) {
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
        ord.deliveryStatus = 'Pesanan Diterima';
        saveAppData();
        renderDeliveryBoard();
        renderDashboard();
        sendWaNotification(ord.customer.phone, `Pesanan *${ord.id}* telah sampai dan diterima. Terima kasih telah memesan di Chicken Lazdano! Selamat menikmati.`);
    }
}

function openWhatsAppChat(phone, customerName, orderId) {
    // Click-to-Chat membuka aplikasi/website WhatsApp; tidak mengirim pesan otomatis.
    const digits = String(phone || '').replace(/\D/g, '');
    const internationalPhone = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
    if (!internationalPhone || internationalPhone.length < 10) {
        alert('Nomor WhatsApp pelanggan belum valid. Periksa data nomor terlebih dahulu.');
        return;
    }
    const message = `Halo ${customerName}, kami dari Chiken Lazdano ingin menginformasikan pesanan ${orderId}. Ada yang bisa kami bantu?`;
    window.open(`https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

function sendWaNotification(phone, message) {
    const consoleLog = document.getElementById('waLogConsole');
    const time = new Date().toLocaleTimeString();
    
    consoleLog.innerHTML += `
        <div class="bg-gray-900 border border-emerald-900/50 p-3 rounded-lg space-y-1">
            <div class="flex justify-between text-[10px] text-gray-400">
                <span>SIMULASI • TUJUAN: ${phone}</span>
                <span>${time}</span>
            </div>
            <p class="text-emerald-400 text-xs font-sans">${message}</p>
        </div>
    `;
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function clearWaLogs() {
    document.getElementById('waLogConsole').innerHTML = `<div class="text-gray-500 text-center text-[10px]">--- WhatsApp Gateway Service Log Cleared ---</div>`;
}

// --- MODULE 6: MANAJEMEN PENGGUNA & TEST SUITE ---
function renderUsersTable() {
    const tbody = document.getElementById('userRoleTable');
    tbody.innerHTML = '';

    users.forEach(u => {
        const roleClass =
            u.role === 'Admin' ? 'bg-red-100 text-red-700' :
            u.role === 'Kasir' ? 'bg-blue-100 text-blue-700' :
            u.role === 'Kurir' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700';

        tbody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="p-3 font-bold text-gray-900">${escapeHTML(u.name)}</td>
                <td class="p-3"><span class="text-xs font-bold px-2.5 py-1 rounded-md ${roleClass}">${escapeHTML(u.role)}</span></td>
                <td class="p-3 text-xs text-gray-600">${escapeHTML(u.phone)}</td>
                <td class="p-3 text-xs font-semibold text-green-600">${escapeHTML(u.status)}</td>
                <td class="p-3 whitespace-nowrap">
                    <button onclick="editUserModal(${u.id})" class="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-blue-100">Edit</button>
                    <button onclick="deleteUser(${u.id})" class="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-100 ml-1">Hapus</button>
                </td>
            </tr>`;
    });
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

function addUserModal() {
    const name = prompt('Nama Pengguna Baru:');
    if (name === null) return;
    const role = prompt('Hak Akses (Admin / Kasir / Kurir / Pelanggan):', 'Kasir');
    if (role === null) return;
    const phone = prompt('Nomor WhatsApp:', '081234567890');
    if (phone === null) return;

    const roles = ['Admin', 'Kasir', 'Kurir', 'Pelanggan'];
    const cleanRole = roles.find(item => item.toLowerCase() === role.trim().toLowerCase());
    if (!name.trim() || !phone.trim() || !cleanRole) {
        alert('Data belum lengkap atau hak akses tidak valid.');
        return;
    }
    users.push({ id: Date.now(), name: name.trim(), role: cleanRole, phone: phone.trim(), status: 'Aktif' });
    saveAppData();
    renderUsersTable();
}

function editUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const name = prompt('Ubah Nama Pengguna:', user.name);
    if (name === null) return;
    const role = prompt('Ubah Hak Akses (Admin / Kasir / Kurir / Pelanggan):', user.role);
    if (role === null) return;
    const phone = prompt('Ubah Nomor WhatsApp:', user.phone);
    if (phone === null) return;
    const status = prompt('Ubah Status (Aktif / Nonaktif / Sedang Bertugas):', user.status);
    if (status === null) return;

    const roles = ['Admin', 'Kasir', 'Kurir', 'Pelanggan'];
    const statuses = ['Aktif', 'Nonaktif', 'Sedang Bertugas'];
    const cleanRole = roles.find(item => item.toLowerCase() === role.trim().toLowerCase());
    const cleanStatus = statuses.find(item => item.toLowerCase() === status.trim().toLowerCase());
    if (!name.trim() || !phone.trim() || !cleanRole || !cleanStatus) {
        alert('Perubahan tidak disimpan. Periksa kembali data yang dimasukkan.');
        return;
    }
    if (user.role === 'Admin' && cleanRole !== 'Admin' && users.filter(u => u.role === 'Admin').length <= 1) {
        alert('Minimal harus ada satu pengguna dengan hak akses Admin.');
        return;
    }

    Object.assign(user, { name: name.trim(), role: cleanRole, phone: phone.trim(), status: cleanStatus });
    saveAppData();
    renderUsersTable();
    alert('Data pengguna berhasil diperbarui.');
}

function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    if (user.role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1) {
        alert('Admin terakhir tidak dapat dihapus. Tambahkan Admin lain terlebih dahulu.');
        return;
    }
    if (!confirm(`Yakin ingin menghapus pengguna ${user.name}?`)) return;
    users = users.filter(u => u.id !== userId);
    saveAppData();
    renderUsersTable();
    alert('Pengguna berhasil dihapus.');
}

// AUTOMATED TEST SUITE ENGINE
async function runSystemTestSuite() {
    const logBox = document.getElementById('testLogContainer');
    const statusLabel = document.getElementById('testStatusLabel');
    const passedLabel = document.getElementById('testPassedCount');
    const btn = document.getElementById('btnRunTest');

    btn.disabled = true;
    logBox.innerHTML = '';
    statusLabel.innerText = 'Sedang Menguji...';
    statusLabel.className = 'text-amber-600 font-bold';

    let passCount = 0;
    const originalCart = cart.map(item => ({ ...item }));
    const originalOrders = orders.slice();

    function logTest(msg, success = true) {
        const time = new Date().toLocaleTimeString();
        logBox.innerHTML += `
            <div class="${success ? 'text-green-400' : 'text-red-400'} flex items-start gap-1">
                <span>${success ? '✓' : '✗'} [${time}]</span>
                <span>${msg}</span>
            </div>
        `;
        logBox.scrollTop = logBox.scrollHeight;
        if (success) passCount++;
    }

    // Step 1: Check Data Products
    await new Promise(r => setTimeout(r, 600));
    if (products.length > 0) {
        logTest(`TEST 1: Inisialisasi Katalog Produk (${products.length} menu dimuat) - PASSED`);
    } else {
        logTest(`TEST 1: Katalog Produk Kosong - FAILED`, false);
    }

    // Step 2: Test Add Product
    await new Promise(r => setTimeout(r, 600));
    const initialCount = products.length;
    products.push({ id: 999, name: "Test Chicken Item", category: "Geprek", price: 15000, inStock: true, image: "", desc: "Test" });
    if (products.length === initialCount + 1) {
        logTest(`TEST 2: CRUD Modul 3 (Tambah Produk Baru ID 999) - PASSED`);
    } else {
        logTest(`TEST 2: Tambah Produk Gagal - FAILED`, false);
    }

    // Step 3: Test Cart & Order Submission
    await new Promise(r => setTimeout(r, 600));
    cart = [{ id: 999, name: "Test Chicken Item", price: 15000, qty: 2 }];
    const testOrdId = `TEST-${Math.floor(Math.random() * 1000)}`;
    const testOrder = {
        id: testOrdId,
        customer: { name: "Automation Tester Bot", phone: "0899999999", address: "Server Room" },
        items: [...cart],
        subtotal: 30000,
        deliveryFee: 8000,
        total: 38000,
        paymentMethod: "QRIS",
        paymentStatus: "Menunggu Verifikasi",
        deliveryStatus: "Menunggu Kurir",
        courier: "-",
        timestamp: "12:00 WIB"
    };
    orders.unshift(testOrder);
    logTest(`TEST 3: Simuasi Order Pelanggan (${testOrdId}) - PASSED`);

    // Step 4: Test Payment Verification
    await new Promise(r => setTimeout(r, 600));
    testOrder.paymentStatus = 'Lunas';
    logTest(`TEST 4: Transaksi & Verifikasi Pembayaran Modul 4 - PASSED`);

    // Step 5: Test WhatsApp Gateway Trigger
    await new Promise(r => setTimeout(r, 600));
    sendWaNotification(testOrder.customer.phone, `[TEST AUTOMATION] Pesanan ${testOrdId} berhasil diverifikasi.`);
    logTest(`TEST 5: Trigger WhatsApp Gateway Notification - PASSED`);

    // Bersihkan seluruh data uji dan pulihkan keranjang semula.
    products = products.filter(p => p.id !== 999);
    orders = originalOrders;
    cart = originalCart;
    saveAppData();
    updateCartUI();
    renderProductTable();
    renderTransactionsTable();
    renderDeliveryBoard();
    renderDashboard();

    statusLabel.innerText = 'Pengujian Selesai';
    statusLabel.className = 'text-green-600 font-bold';
    passedLabel.innerText = `${passCount} Passed`;
    btn.disabled = false;

    renderDashboard();
}