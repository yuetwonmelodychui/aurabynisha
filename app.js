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
   PRODUCT MODALS
   ========================================================= */
let popupAutoTimer = null;

function startPopupAutoRotate(modalEl) {
  stopPopupAutoRotate();
  const carousel = modalEl.querySelector('.popup-img-carousel');
  if (!carousel || !carousel.id) return;
  const slides = carousel.querySelectorAll('.popup-img-slide');
  if (slides.length < 2) return; // nothing to rotate through
  popupAutoTimer = setInterval(() => movePopup(carousel.id, 1), 2000);
}

function stopPopupAutoRotate() {
  if (popupAutoTimer) {
    clearInterval(popupAutoTimer);
    popupAutoTimer = null;
  }
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'flex';
  startPopupAutoRotate(el); // auto-advance the popup images every 2s
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
  stopPopupAutoRotate();
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

  // Auto-advance any feature carousels present on the page
  document.querySelectorAll('.custom-carousel').forEach(function (carousel) {
    if (carousel.id) {
      setInterval(() => moveCarousel(carousel.id, 1), 3000);
    }
  });

  // Close product modals when clicking the backdrop
  document.querySelectorAll('.product-modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.style.display = 'none';
        stopPopupAutoRotate();
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
