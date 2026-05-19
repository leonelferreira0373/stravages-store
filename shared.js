// Product Database
const PRODUCTS = [
  { id: 'beanie-black', name: 'Stravages Beanie Black', price: 29.90, img: 'products/beanie-black-1.jpg', category: 'beanies' },
  { id: 'beanie-white', name: 'Stravages Beanie White', price: 29.90, img: 'products/beanie-white-1.jpg', category: 'beanies' },
  { id: 'beanie-pink', name: 'Stravages Beanie Pink', price: 29.90, img: 'products/beanie-pink-1.jpg', category: 'beanies' },
  { id: 'beanie-yellow', name: 'Stravages Beanie Yellow', price: 29.90, img: 'products/beanie-yellow-1.jpg', category: 'beanies' },
  { id: 'balaclava-premium', name: 'Stravages Balaclava Premium', price: 34.90, img: 'products/balaclava-1.jpg', category: 'accessories' },
  { id: 'stravages-set', name: 'Stravages Tracksuit Set', price: 129.90, img: 'products/tracksuit-yellow-1.jpg', category: 'tracksuits' },
  { id: 'stravages-wallet', name: 'Stravages Wallet Premium', price: 19.90, img: 'products/wallet-1.png', category: 'accessories' }
];

// Cart State (Persisted in localStorage)
let cart = JSON.parse(localStorage.getItem('stravages-cart')) || [];

// User Session State (Persisted in localStorage)
let userSession = JSON.parse(localStorage.getItem('stravages-user')) || null;

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject modals and cart drawer HTML structures
  injectGlobalUI();

  // 2. Setup scroll transition for Header
  setupHeaderScroll();

  // 3. Setup Navigation Menu Toggles
  setupNavigationEvents();

  // 4. Initialize Cart UI
  updateCartUI();

  // 5. Setup Search Functionality
  setupSearchEvents();

  // 6. Setup Profile/Login Functionality
  setupProfileEvents();

  // 7. Setup Checkout Events
  setupCheckoutEvents();

  // 8. Bind Add to Cart buttons on current page (if any)
  bindPageProductButtons();
});

// Save cart helper
function saveCart() {
  localStorage.setItem('stravages-cart', JSON.stringify(cart));
  // Broadcast update to other tabs/windows
  window.dispatchEvent(new Event('storage'));
}

// Listen to storage changes to sync cart across pages/tabs
window.addEventListener('storage', () => {
  cart = JSON.parse(localStorage.getItem('stravages-cart')) || [];
  updateCartUI();
});

// Dynamic Injection of Drawer and Overlay Markups (All Drawers are Side Menus)
function injectGlobalUI() {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Cart Drawer -->
    <div class="cart-drawer" id="cart-drawer">
      <div class="cart-drawer-header">
        <h3 class="cart-drawer-title">Carrinho</h3>
        <button class="btn-close-cart" id="close-cart-btn" title="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="cart-items-container" id="cart-items-list">
        <!-- Rendered dynamically -->
      </div>
      <div class="cart-drawer-footer">
        <div class="cart-summary-row">
          <span class="cart-summary-label">Subtotal</span>
          <span class="cart-summary-value" id="cart-subtotal">0,00€</span>
        </div>
        <button class="btn-checkout" id="checkout-drawer-btn">Finalizar Compra</button>
      </div>
    </div>

    <!-- Search Side Drawer -->
    <div class="search-drawer" id="search-overlay">
      <button class="btn-close-modal" id="close-search-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h3 class="modal-title">Pesquisar</h3>
      <div class="search-input-wrapper">
        <input type="text" id="search-input" placeholder="O que procuras?" autocomplete="off">
        <svg viewBox="0 0 24 24" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <div class="search-results-info" id="search-results-list"></div>
    </div>

    <!-- Profile Side Drawer -->
    <div class="profile-drawer" id="profile-overlay">
      <!-- Injected dynamically -->
    </div>

    <!-- Checkout Side Drawer -->
    <div class="checkout-drawer" id="checkout-overlay">
      <!-- Injected dynamically -->
    </div>

    <!-- Unified Sidebar Drawer Overlay Backdrop -->
    <div class="cart-overlay" id="cart-overlay"></div>
  `;
  document.body.appendChild(container);

  // Add mobile hamburger toggle dynamically in header if it's missing
  const navContainer = document.querySelector('.nav-container');
  if (navContainer && !document.querySelector('.menu-toggle')) {
    const hamburger = document.createElement('button');
    hamburger.className = 'menu-toggle';
    hamburger.id = 'mobile-menu-toggle';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    // Insert before nav-icons
    const navIcons = document.querySelector('.nav-icons');
    if (navIcons) {
      navContainer.insertBefore(hamburger, navIcons);
    } else {
      navContainer.appendChild(hamburger);
    }
  }
}

// Scroll interaction for main header styling
function setupHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Close all active side drawers
function closeAllDrawers() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('profile-overlay').classList.remove('open');
  document.getElementById('checkout-overlay').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

// Navigation triggers
function setupNavigationEvents() {
  const cartBtn = document.getElementById('cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');

  // Toggle Cart
  const toggleCart = () => {
    const isOpen = cartDrawer.classList.contains('open');
    closeAllDrawers();
    if (!isOpen) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('open');
    }
  };

  if (cartBtn) cartBtn.addEventListener('click', toggleCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeAllDrawers);

  // Mobile Hamburger Menu Trigger
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      navLinks.classList.toggle('mobile-open');
    });

    // Close menu when clicking links
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navLinks.classList.remove('mobile-open');
      });
    });
  }
}

// Bind product cards Add to Cart buttons
function bindPageProductButtons() {
  document.querySelectorAll('.product-card').forEach(card => {
    const btn = card.querySelector('.btn-add-cart');
    if (btn) {
      // Clean duplicate listeners
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseFloat(card.getAttribute('data-price'));
        const img = card.querySelector('.product-card-img')?.getAttribute('src') || '';
        addToCart(id, name, price, img);
      });
    }
  });
}

// Cart additions
function addToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  updateCartUI();

  // Open cart side drawer
  closeAllDrawers();
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}

// Change Quantity inside Cart
function changeQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  updateCartUI();
}

// Remove from Cart
function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

// Update Cart Badge and Drawer items
function updateCartUI() {
  const listContainer = document.getElementById('cart-items-list');
  const badge = document.getElementById('cart-badge');
  const subtotalElem = document.getElementById('cart-subtotal');
  if (!listContainer || !badge || !subtotalElem) return;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalItems;

  if (cart.length === 0) {
    listContainer.innerHTML = '<p class="cart-empty-msg">O carrinho está vazio.</p>';
    subtotalElem.textContent = '0,00€';
    return;
  }

  let html = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    html += `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.img}" alt="${item.name}" style="width: 100%; height: auto; object-fit: cover; border-radius: 2px;">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <p class="cart-item-price">${item.price.toFixed(2).replace('.', ',')}€</p>
          <div class="cart-qty-controls">
            <button class="btn-qty" onclick="changeQty('${item.id}', -1)">-</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="btn-qty" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="btn-remove-item" onclick="removeItem('${item.id}')" title="Remover">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
  });

  listContainer.innerHTML = html;
  subtotalElem.textContent = subtotal.toFixed(2).replace('.', ',') + '€';
}

// Search Functionality
function setupSearchEvents() {
  const searchBtn = document.getElementById('search-btn');
  const closeSearchBtn = document.getElementById('close-search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');

  const toggleSearch = () => {
    const isOpen = searchOverlay.classList.contains('open');
    closeAllDrawers();
    if (!isOpen) {
      searchOverlay.classList.add('open');
      document.getElementById('cart-overlay').classList.add('open');
      searchInput.focus();
      renderSearchResults('');
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', toggleSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeAllDrawers);

  // Close search when pressing ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
      closeAllDrawers();
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.trim());
    });
  }
}

function renderSearchResults(query) {
  const list = document.getElementById('search-results-list');
  if (!list) return;

  if (!query) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">Introduz algo para pesquisar...</p>';
    return;
  }

  const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  if (results.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">Nenhum produto encontrado.</p>';
    return;
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">';
  results.forEach(product => {
    html += `
      <div style="display: flex; gap: 15px; align-items: center; background-color: var(--bg-primary); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 4px; cursor: pointer;" onclick="goToProduct('${product.id}')">
        <img src="${product.img}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 2px;">
        <div style="flex-grow: 1;">
          <h4 style="font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">${product.name}</h4>
          <p style="font-family: var(--font-serif); color: var(--gold-primary); font-size: 0.85rem;">${product.price.toFixed(2).replace('.', ',')}€</p>
        </div>
      </div>
    `;
  });
  html += '</div>';
  list.innerHTML = html;
}

function goToProduct(id) {
  closeAllDrawers();
  if (window.location.pathname.includes('shop.html')) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth' });
      card.style.borderColor = 'var(--gold-primary)';
      setTimeout(() => card.style.borderColor = '', 2000);
    }
  } else {
    window.location.href = `shop.html?product=${id}`;
  }
}

// User Profile / Dashboard Side Drawer logic
function setupProfileEvents() {
  const profileBtn = document.getElementById('profile-btn');
  const profileOverlay = document.getElementById('profile-overlay');

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      const isOpen = profileOverlay.classList.contains('open');
      closeAllDrawers();
      if (!isOpen) {
        profileOverlay.classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
        renderProfileUI();
      }
    });
  }
}

function renderProfileUI() {
  const container = document.getElementById('profile-overlay');
  if (!container) return;

  if (userSession) {
    container.innerHTML = `
      <button class="btn-close-modal" id="close-profile-btn" onclick="closeAllDrawers()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="dashboard-header">
        <h3 class="dashboard-title">Olá, ${userSession.name}!</h3>
        <span class="btn-logout" onclick="handleLogout()">Sair</span>
      </div>
      <div>
        <p style="font-size: 0.8rem; margin-bottom: 25px; color: var(--text-secondary); text-transform: uppercase;">
          Email: <span style="color: var(--text-primary); text-transform: none;">${userSession.email}</span><br>
          Membro colmeia desde: <span style="color: var(--text-primary);">19/05/2026</span>
        </p>
        <h4 class="order-history-title">Encomendas</h4>
        <div style="max-height: calc(100vh - 280px); overflow-y: auto;">
          ${userSession.orders && userSession.orders.length > 0 ? userSession.orders.map(order => `
            <div class="order-item">
              <div class="order-meta">
                <span>Ref: #${order.id}</span>
                <span>${order.date}</span>
              </div>
              <div class="order-products" style="color: var(--text-secondary); margin-bottom: 5px;">${order.items.join(', ')}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 5px; margin-top: 5px;">
                <span style="font-size: 0.65rem; color: #ffbc00; text-transform: uppercase; font-weight: bold;">Aguardar IBAN</span>
                <span style="font-weight: 600; color: var(--gold-primary);">${order.total.toFixed(2).replace('.', ',')}€</span>
              </div>
            </div>
          `).join('') : '<p style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase;">Nenhuma compra efetuada.</p>'}
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn-close-modal" id="close-profile-btn" onclick="closeAllDrawers()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h3 class="modal-title">Entrar na Colmeia</h3>
      <form id="login-form" onsubmit="handleLoginSubmit(event)">
        <div class="form-group">
          <label for="login-name">Nome Completo</label>
          <input type="text" id="login-name" required placeholder="O teu nome">
        </div>
        <div class="form-group">
          <label for="login-email">Endereço de Email</label>
          <input type="email" id="login-email" required placeholder="nome@exemplo.com">
        </div>
        <button type="submit" class="btn-submit-gold" style="width: 100%; margin-top: 10px;">Aceder</button>
      </form>
    `;
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('login-name').value.trim();
  const email = document.getElementById('login-email').value.trim();

  if (name && email) {
    userSession = {
      name,
      email,
      orders: []
    };
    localStorage.setItem('stravages-user', JSON.stringify(userSession));
    renderProfileUI();
  }
}

function handleLogout() {
  userSession = null;
  localStorage.removeItem('stravages-user');
  renderProfileUI();
}

// Checkout Side Drawer Logic
let checkoutStep = 1;
let checkoutData = {
  address: {},
  orderId: 0
};

function setupCheckoutEvents() {
  const checkoutBtn = document.getElementById('checkout-drawer-btn');
  const checkoutOverlay = document.getElementById('checkout-overlay');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('O teu carrinho está vazio.');
        return;
      }
      closeAllDrawers();
      checkoutOverlay.classList.add('open');
      document.getElementById('cart-overlay').classList.add('open');
      checkoutStep = 1;
      renderCheckoutUI();
    });
  }
}

function renderCheckoutUI() {
  const container = document.getElementById('checkout-overlay');
  if (!container) return;

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (checkoutStep === 1) {
    container.innerHTML = `
      <button class="btn-close-modal" id="close-checkout-btn" onclick="closeAllDrawers()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h3 class="modal-title">Checkout</h3>
      <div class="checkout-steps-nav">
        <span class="checkout-step-tab active">1. Envio</span>
        <span class="checkout-step-tab">2. Confirmação</span>
      </div>
      <form onsubmit="submitCheckoutStep1(event)">
        <div class="form-group">
          <label for="co-name">Nome Completo</label>
          <input type="text" id="co-name" required value="${checkoutData.address.name || (userSession ? userSession.name : '')}">
        </div>
        <div class="form-group">
          <label for="co-email">Email</label>
          <input type="email" id="co-email" required value="${checkoutData.address.email || (userSession ? userSession.email : '')}">
        </div>
        <div class="form-group">
          <label for="co-address">Morada de Entrega</label>
          <input type="text" id="co-address" required placeholder="Rua, número, andar" value="${checkoutData.address.street || ''}">
        </div>
        <div class="checkout-form-grid">
          <div class="form-group">
            <label for="co-postal">Código Postal</label>
            <input type="text" id="co-postal" required placeholder="0000-000" value="${checkoutData.address.zip || ''}">
          </div>
          <div class="form-group">
            <label for="co-city">Cidade</label>
            <input type="text" id="co-city" required value="${checkoutData.address.city || ''}">
          </div>
        </div>
        <div class="checkout-buttons">
          <span></span>
          <button type="submit" class="btn-checkout-next">Seguinte</button>
        </div>
      </form>
    `;
  } else if (checkoutStep === 2) {
    container.innerHTML = `
      <button class="btn-close-modal" id="close-checkout-btn" onclick="closeAllDrawers()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h3 class="modal-title">Pagamento</h3>
      <div class="checkout-steps-nav">
        <span class="checkout-step-tab">1. Envio</span>
        <span class="checkout-step-tab active">2. Confirmação</span>
      </div>
      <div>
        <div style="background-color: var(--bg-primary); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 4px; margin-bottom: 25px;">
          <h4 style="font-size: 0.75rem; text-transform: uppercase; color: var(--gold-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Transferência Bancária
          </h4>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.6;">
            Pagamento por transferência bancária. Após confirmares a encomenda, irás receber os dados do IBAN e a referência correspondente para efetuar a transferência.
          </p>
        </div>

        <!-- Summary list -->
        <div style="margin-bottom: 25px;">
          <h4 style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 15px;">Resumo dos Artigos</h4>
          <div style="max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
            ${cart.map(item => `
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 6px;">
                <span style="color: var(--text-primary);">${item.name} <span style="color: var(--text-secondary);">x${item.qty}</span></span>
                <span style="color: var(--gold-primary); font-weight: 600;">${(item.price * item.qty).toFixed(2).replace('.', ',')}€</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="checkout-buttons">
          <button type="button" class="btn-checkout-prev" onclick="prevCheckoutStep()">Voltar</button>
          <button type="button" class="btn-checkout-next" onclick="submitCheckoutStep2()">Confirmar Encomenda (${total.toFixed(2).replace('.', ',')}€)</button>
        </div>
      </div>
    `;
  } else if (checkoutStep === 3) {
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);
    const estDateStr = estDate.toLocaleDateString('pt-PT');

    container.innerHTML = `
      <button class="btn-close-modal" id="close-checkout-btn" onclick="finalizeCheckoutOrder()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="receipt-container">
        <div class="receipt-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 class="receipt-title">Encomenda Recebida!</h3>
        <p class="receipt-text" style="margin-bottom: 20px;">Obrigado pela tua compra. Para concluir, efetua a transferência bancária.</p>
        
        <div class="receipt-details" style="padding: 15px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; background-color: var(--bg-primary);">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 4px;">
            <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; display: block;">Referência da Encomenda</span>
            <span style="font-size: 1.4rem; color: var(--text-primary); font-family: monospace; font-weight: bold; letter-spacing: 0.05em;">#${checkoutData.orderId}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Beneficiário</span>
              <span style="color: var(--text-primary); font-weight: 500;">Plug Empire</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">IBAN</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: var(--text-primary); font-family: monospace; font-weight: bold;">LT94 3250 0121 0231 5412</span>
                <button type="button" onclick="copyToClipboard('LT94 3250 0121 0231 5412', this)" style="background: none; border: none; cursor: pointer; color: var(--gold-primary); display: flex; align-items: center;" title="Copiar IBAN">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Montante</span>
              <span style="color: var(--gold-primary); font-weight: bold; font-size: 0.85rem;">${total.toFixed(2).replace('.', ',')}€</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Referência</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: var(--text-primary); font-family: monospace; font-weight: bold;">#${checkoutData.orderId}</span>
                <button type="button" onclick="copyToClipboard('#${checkoutData.orderId}', this)" style="background: none; border: none; cursor: pointer; color: var(--gold-primary); display: flex; align-items: center;" title="Copiar Referência">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-bottom: 20px; line-height: 1.4;">
          Enviámos uma confirmação para <strong>${checkoutData.address.email}</strong> com todos estes dados. Quando a transferência chegar, preparamos o envio.
        </p>

        <button class="btn-submit-gold" style="width: 100%;" onclick="finalizeCheckoutOrder()">Voltar ao Site</button>
      </div>
    `;
  }
}

function prevCheckoutStep() {
  checkoutStep = 1;
  renderCheckoutUI();
}

function submitCheckoutStep1(e) {
  e.preventDefault();
  checkoutData.address = {
    name: document.getElementById('co-name').value,
    email: document.getElementById('co-email').value,
    street: document.getElementById('co-address').value,
    zip: document.getElementById('co-postal').value,
    city: document.getElementById('co-city').value
  };
  checkoutStep = 2;
  renderCheckoutUI();
}

function submitCheckoutStep2() {
  checkoutData.orderId = Math.floor(Math.random() * 90000) + 10000;
  
  // Save order in session history if user is logged in
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (userSession) {
    userSession.orders.push({
      id: checkoutData.orderId,
      date: new Date().toLocaleDateString('pt-PT'),
      items: cart.map(i => `${i.name} (x${i.qty})`),
      total: total
    });
    localStorage.setItem('stravages-user', JSON.stringify(userSession));
  }

  checkoutStep = 3;
  renderCheckoutUI();
}

function copyToClipboard(text, btnElement) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).then(() => {
    // Give visual feedback by swapping icon or color briefly
    const originalHTML = btnElement.innerHTML;
    btnElement.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2" style="width: 14px; height: 14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    setTimeout(() => {
      btnElement.innerHTML = originalHTML;
    }, 1200);
  });
}

function finalizeCheckoutOrder() {
  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();
  closeAllDrawers();
}

// Footer toggles (language pill + theme pill) — minimal state, persisted in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('stravages-lang') || 'pt';
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.lang === savedLang);
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      localStorage.setItem('stravages-lang', lang);
      document.querySelectorAll('.lang-btn').forEach((b) =>
        b.classList.toggle('is-active', b.dataset.lang === lang)
      );
      document.documentElement.setAttribute('lang', lang);
    });
  });

  const savedTheme = localStorage.getItem('stravages-theme') || 'dark';
  document.documentElement.classList.toggle('light', savedTheme === 'light');
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.classList.toggle('is-light', savedTheme === 'light');
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light');
      localStorage.setItem('stravages-theme', isLight ? 'light' : 'dark');
      document.querySelectorAll('.theme-toggle').forEach((b) =>
        b.classList.toggle('is-light', isLight)
      );
    });
  });
});
