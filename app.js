/* =========================================================
   AURA — shared site script
   Handles: mobile menu, scroll arrow, carousels, product
   modals, shopping cart, and the welcome signup popup.
   Loaded on every page.
   ========================================================= */

/* ---- CONFIG ---------------------------------------------------------- */
// Stripe checkout link. This is currently the TEST link — replace with your
// live payment link when you go live. For per-product pricing you can create
// one Stripe link per product and store it on each Add-to-Cart button.
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_14AcN52iI8A7aja7vk0x200';
const CART_KEY = 'aura_cart';

/* =========================================================
   MOBILE MENU
   ========================================================= */
function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu) menu.classList.toggle('show');
}

/* =========================================================
   CAROUSELS (feature carousels)
   ========================================================= */
function moveCarousel(id, dir) {
  const carousel = document.getElementById(id);
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.custom-carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  let current = Array.from(slides).findIndex(s => s.classList.contains('active'));
  slides[current].classList.remove('active');
  if (dots.length) dots[current].classList.remove('active');
  current = (current + dir + slides.length) % slides.length;
  slides[current].classList.add('active');
  if (dots.length) dots[current].classList.add('active');
}

function goToSlide(id, index) {
  const carousel = document.getElementById(id);
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.custom-carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
}

/* =========================================================
   PRODUCT POPUP IMAGE CAROUSELS
   ========================================================= */
function movePopup(id, dir) {
  const carousel = document.getElementById(id);
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.popup-img-slide');
  const dots = carousel.querySelectorAll('.popup-dot');
  let current = Array.from(slides).findIndex(s => s.classList.contains('active'));
  slides[current].classList.remove('active');
  if (dots.length) dots[current].classList.remove('active');
  current = (current + dir + slides.length) % slides.length;
  slides[current].classList.add('active');
  if (dots.length) dots[current].classList.add('active');
}

function goToPopupSlide(id, index) {
  const carousel = document.getElementById(id);
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.popup-img-slide');
  const dots = carousel.querySelectorAll('.popup-dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
}

/* =========================================================
   PRODUCT MODALS (full-screen split view)
   Images are static — a large main image with clickable
   thumbnails. No auto-rotation or sliding anywhere.
   ========================================================= */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // lock scroll behind the full-screen view
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
  document.body.style.overflow = '';
}

/* =========================================================
   SHOPPING CART
   ========================================================= */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Called from product buttons: addToCart(event, 'Silky Hijab', 30)
function addToCart(event, name, price) {
  if (event) event.stopPropagation(); // don't also trigger the card's modal
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: name, price: Number(price), qty: 1 });
  }
  saveCart(cart);
  renderCart();
  updateCartCount();
  openCart();
}

function changeQty(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function removeFromCart(name) {
  let cart = getCart();
  cart = cart.filter(i => i.name !== name);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartCount() {
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function renderCart() {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!list || !totalEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    totalEl.textContent = '$0.00 USD';
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)} USD</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
        <button class="cart-item-remove" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">Remove</button>
      </div>
    </div>
  `).join('');

  totalEl.textContent = '$' + cartTotal().toFixed(2) + ' USD';
}

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('show');
  if (overlay) overlay.classList.add('show');
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
}

function checkout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  // NOTE: This sends the shopper to your Stripe payment link. The line items
  // are stored locally so you can reconcile the order; the amount charged is
  // whatever the Stripe link is configured for.
  window.location.href = STRIPE_CHECKOUT_URL;
}

/* =========================================================
   WELCOME SIGNUP POPUP
   ========================================================= */
function closeSignup() {
  const el = document.getElementById('signup-overlay');
  if (el) el.classList.remove('show');
  sessionStorage.setItem('aura_signup_seen', '1');
}

function submitSignup(event) {
  event.preventDefault();
  const form = document.getElementById('signup-form');
  const thanks = document.getElementById('signup-thanks');
  if (form) form.style.display = 'none';
  if (thanks) thanks.style.display = 'block';
  sessionStorage.setItem('aura_signup_seen', '1');
}

/* Feedback form — no backend yet; shows a thank-you message on submit.
   Wire this to a form service (Formspree, etc.) later if you want the
   messages emailed to you. */
function submitFeedback(event) {
  event.preventDefault();
  const form = document.getElementById('feedback-form');
  const thanks = document.getElementById('feedback-thanks');
  if (form) form.style.display = 'none';
  if (thanks) thanks.style.display = 'block';
}

function maybeShowSignup() {
  if (sessionStorage.getItem('aura_signup_seen')) return;
  setTimeout(() => {
    const el = document.getElementById('signup-overlay');
    if (el) el.classList.add('show');
  }, 1200);
}

/* =========================================================
   INJECTED MARKUP (cart drawer + signup popup)
   Injected once per page so all pages stay in sync.
   ========================================================= */
function injectCart() {
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cart-overlay';
  overlay.addEventListener('click', closeCart);

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.id = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-header">
      <h2>Your Cart</h2>
      <button class="cart-close" onclick="closeCart()">✕</button>
    </div>
    <div class="cart-items" id="cart-items"></div>
    <div class="cart-footer">
      <div class="cart-total-row">
        <span>Total</span>
        <span id="cart-total">$0.00 USD</span>
      </div>
      <button class="buy-btn cart-checkout" onclick="checkout()">Checkout</button>
      <p class="cart-note">Secure checkout powered by Stripe.</p>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
}

/* Static image thumbnails — replaces all carousel movement. Builds a
   thumbnail strip from the existing slides for both the feature galleries
   and the product detail popups. Clicking a thumbnail swaps the main image
   instantly (no sliding, no auto-play). */
function buildThumbStrip(container, slideSelector) {
  const slides = container.querySelectorAll(slideSelector);
  if (slides.length < 2) return;               // single image — no thumbs needed
  if (container.querySelector('.thumbs')) return; // already built

  const strip = document.createElement('div');
  strip.className = 'thumbs';

  slides.forEach(function (slide, i) {
    const thumb = document.createElement('img');
    thumb.src = slide.src;
    thumb.alt = slide.alt || '';
    thumb.loading = 'lazy';
    thumb.className = 'thumb' + (slide.classList.contains('active') ? ' active' : '');
    thumb.addEventListener('click', function (e) {
      e.stopPropagation();
      slides.forEach(function (s, j) { s.classList.toggle('active', j === i); });
      strip.querySelectorAll('.thumb').forEach(function (t, j) {
        t.classList.toggle('active', j === i);
      });
    });
    strip.appendChild(thumb);
  });

  container.appendChild(strip);
}

function buildThumbnails() {
  // Product detail popups keep the static thumbnail strip. The main
  // "Newest Editions" feature carousel slides on its own (see below).
  document.querySelectorAll('.popup-img-carousel').forEach(function (c) {
    buildThumbStrip(c, '.popup-img-slide');
  });
}

/* Auto-sliding feature carousels — the main "Newest Editions" gallery on
   each product page rotates through its slides and pauses on hover. Manual
   dots still work; clicking one restarts the timer. */
function initFeatureCarousels() {
  const INTERVAL = 4000;
  document.querySelectorAll('.custom-carousel').forEach(function (c) {
    const slides = c.querySelectorAll('.custom-carousel-slide');
    if (slides.length < 2) return; // single image — nothing to rotate

    let timer;
    function start() { timer = setInterval(function () { moveCarousel(c.id, 1); }, INTERVAL); }
    function stop() { clearInterval(timer); }

    c.addEventListener('mouseenter', stop);
    c.addEventListener('mouseleave', start);
    // Restart the timer after any manual navigation (dots or arrows) so it
    // doesn't jump again immediately after the user clicks.
    c.querySelectorAll('.carousel-dot, .custom-carousel-prev, .custom-carousel-next')
      .forEach(function (ctrl) {
        ctrl.addEventListener('click', function () { stop(); start(); });
      });
    start();
  });
}

/* Size selector — injected into every product detail popup so all pages
   stay in sync. Sizes are selectable (visual); the product is a single
   colorway so no colour swatches are shown. */
const AURA_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

function injectSizeSelectors() {
  document.querySelectorAll('.popup-info').forEach(function (info) {
    if (info.querySelector('.popup-sizes')) return; // already added
    const buyBtn = info.querySelector('.buy-btn');

    const wrap = document.createElement('div');
    wrap.className = 'popup-sizes';
    wrap.innerHTML =
      '<span class="size-label">Size</span>' +
      '<div class="size-options">' +
      AURA_SIZES.map(function (s) {
        return '<button type="button" class="size-btn">' + s + '</button>';
      }).join('') +
      '</div>';

    // Single-select toggle within this popup's size row
    wrap.querySelectorAll('.size-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        wrap.querySelectorAll('.size-btn').forEach(function (b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
      });
    });

    if (buyBtn) {
      info.insertBefore(wrap, buyBtn);
    } else {
      info.appendChild(wrap);
    }
  });
}

function injectSignup() {
  const overlay = document.createElement('div');
  overlay.className = 'signup-overlay';
  overlay.id = 'signup-overlay';
  overlay.innerHTML = `
    <div class="signup-box">
      <button class="signup-close" onclick="closeSignup()">✕</button>
      <div class="signup-image"></div>
      <div class="signup-content">
        <h2 class="signup-heading">ENJOY 15% OFF</h2>
        <p class="signup-sub">Be the first to hear about new arrivals, restocks, and members-only offers.</p>
        <form id="signup-form" onsubmit="submitSignup(event)">
          <input type="email" name="email" placeholder="Email Address" required />
          <button type="submit" class="buy-btn signup-submit">Continue</button>
          <p class="signup-fine">By signing up you agree to receive marketing emails from AURA. You can unsubscribe at any time.</p>
        </form>
        <div id="signup-thanks" class="signup-thanks">
          <p class="signup-thanks-title">Thank you for joining AURA ♡</p>
          <p>Keep an eye on your inbox — your welcome offer is on its way.</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  injectCart();
  injectSignup();
  injectSizeSelectors();
  buildThumbnails();
  initFeatureCarousels();
  renderCart();
  updateCartCount();
  maybeShowSignup();

  // Scroll arrow (index page only)
  const arrow = document.getElementById('scroll-arrow');
  if (arrow) {
    arrow.addEventListener('click', function () {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
      arrow.style.opacity = nearBottom ? '0' : '0.75';
    });
  }

  // Close product modals when clicking the backdrop
  document.querySelectorAll('.product-modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  });

  // Close the mobile menu when clicking outside it
  document.addEventListener('click', function (e) {
    const menu = document.getElementById('menu');
    const hamburger = document.getElementById('hamburger');
    if (menu && menu.classList.contains('show') &&
        !menu.contains(e.target) && e.target !== hamburger) {
      menu.classList.remove('show');
    }
  });
});
