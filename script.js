const products = [
  {
    id: 1,
    name: "Original Overdrive",
    category: "original",
    categoryLabel: "Original",
    price: 89,
    description: "Classic citrus energy flavor with a sharp, sparkling finish.",
    facts: ["160 mg caffeine", "14 g sugar", "500 mL can"],
    bg: "linear-gradient(90deg,#171717,#3d3d3d 48%,#111)",
    accent: "#f3c75d"
  },
  {
    id: 2,
    name: "Pure Chaos Zero",
    category: "zero",
    categoryLabel: "Zero Sugar",
    price: 95,
    description: "Bright silver citrus flavor with zero sugar and full attitude.",
    facts: ["150 mg caffeine", "0 g sugar", "500 mL can"],
    bg: "linear-gradient(120deg,#fafafa,#8b8b8b 45%,#f6f6f6 70%,#555)",
    accent: "#111111"
  },
  {
    id: 3,
    name: "Rage Berry",
    category: "fruit",
    categoryLabel: "Fruit",
    price: 99,
    description: "A loud mix of raspberry, cherry, and dark berry flavors.",
    facts: ["160 mg caffeine", "13 g sugar", "500 mL can"],
    bg: "repeating-linear-gradient(35deg,#191919 0 16px,#7a1020 17px 20px,#191919 21px 38px)",
    accent: "#ef334d"
  },
  {
    id: 4,
    name: "Toxic Lime",
    category: "fruit",
    categoryLabel: "Fruit",
    price: 99,
    description: "Electric lime flavor with a sour snap and crisp finish.",
    facts: ["155 mg caffeine", "12 g sugar", "500 mL can"],
    bg: "linear-gradient(120deg,#07160a,#193d17 48%,#050505)",
    accent: "#8cff32"
  },
  {
    id: 5,
    name: "Midnight Grape Zero",
    category: "zero",
    categoryLabel: "Zero Sugar",
    price: 95,
    description: "Dark grape and blackberry flavor without the sugar crash.",
    facts: ["150 mg caffeine", "0 g sugar", "500 mL can"],
    bg: "linear-gradient(120deg,#11051a,#54227b 50%,#120718)",
    accent: "#d994ff"
  },
  {
    id: 6,
    name: "Mango Meltdown",
    category: "fruit",
    categoryLabel: "Fruit",
    price: 99,
    description: "Juicy mango flavor with tropical citrus and a bright finish.",
    facts: ["160 mg caffeine", "13 g sugar", "500 mL can"],
    bg: "linear-gradient(120deg,#291400,#ce6e05 50%,#251003)",
    accent: "#ffd447"
  }
];

let cart = JSON.parse(localStorage.getItem("chudJugCart")) || [];
let activeProduct = null;

const productGrid = document.getElementById("productGrid");
const template = document.getElementById("productTemplate");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");
const modal = document.getElementById("productModal");

function peso(value) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term);
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  productGrid.innerHTML = "";

  if (!filtered.length) {
    productGrid.innerHTML = '<div class="empty-state">No flavors matched your search.</div>';
    return;
  }

  filtered.forEach(product => {
    const card = template.content.cloneNode(true);
    const article = card.querySelector(".product-card");
    const visual = card.querySelector(".product-visual");
    const miniCan = card.querySelector(".mini-can");

    visual.style.background = `radial-gradient(circle, ${product.accent}33, transparent 60%), #0b0b0b`;
    miniCan.style.setProperty("--can-bg", product.bg);
    miniCan.style.setProperty("--can-accent", product.accent);
    miniCan.querySelector("span").textContent = product.name;

    card.querySelector(".product-type").textContent = product.categoryLabel;
    card.querySelector("h3").textContent = product.name;
    card.querySelector(".product-description").textContent = product.description;
    card.querySelector(".product-price").textContent = peso(product.price);

    visual.addEventListener("click", () => openProductModal(product));
    card.querySelector(".add-button").addEventListener("click", () => addToCart(product.id));
    productGrid.appendChild(card);

    requestAnimationFrame(() => article.classList.add("visible"));
  });
}

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ id: productId, quantity: 1 });
  saveCart();
  openCart();
}

function changeQuantity(productId, amount) {
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== productId);
  saveCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

function saveCart() {
  localStorage.setItem("chudJugCart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = peso(totalPrice);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is currently empty.</p>';
    return;
  }

  cart.forEach(item => {
    const product = products.find(entry => entry.id === item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-thumb" style="--can-bg:${product.bg}; background:${product.bg}"></div>
      <div>
        <h4>${product.name}</h4>
        <div class="quantity">
          <button data-action="minus" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-action="plus" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div>
        <strong>${peso(product.price * item.quantity)}</strong><br>
        <button class="remove-button">Remove</button>
      </div>`;

    row.querySelector('[data-action="minus"]').addEventListener("click", () => changeQuantity(product.id, -1));
    row.querySelector('[data-action="plus"]').addEventListener("click", () => changeQuantity(product.id, 1));
    row.querySelector(".remove-button").addEventListener("click", () => removeFromCart(product.id));
    cartItems.appendChild(row);
  });
}

function openCart() {
  closeModal();
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

function openProductModal(product) {
  activeProduct = product;
  document.getElementById("modalCategory").textContent = product.categoryLabel;
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById("modalFacts").innerHTML = product.facts.map(fact => `<li>${fact}</li>`).join("");

  const visual = document.getElementById("modalVisual");
  visual.style.setProperty("--modal-bg", `radial-gradient(circle, ${product.accent}55, transparent 65%), #080808`);
  visual.innerHTML = `<div class="mini-can" style="--can-bg:${product.bg};--can-accent:${product.accent};"><span>${product.name}</span></div>`;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  overlay.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!cartDrawer.classList.contains("open")) {
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }
}

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("modalAddButton").addEventListener("click", () => {
  if (activeProduct) addToCart(activeProduct.id);
});
overlay.addEventListener("click", () => {
  closeCart();
  closeModal();
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }
  alert("Checkout simulation complete! Thanks for choosing Chud Jug.");
  cart = [];
  saveCart();
  closeCart();
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const status = document.getElementById("formStatus");
  const fields = ["name", "email", "subject", "message"].map(id => document.getElementById(id));
  const emptyField = fields.find(field => !field.value.trim());
  const email = document.getElementById("email");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

  if (emptyField) {
    status.textContent = "Please complete all fields.";
    emptyField.focus();
    return;
  }
  if (!emailValid) {
    status.textContent = "Please enter a valid email address.";
    email.focus();
    return;
  }

  status.textContent = "Message sent successfully!";
  event.target.reset();
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeModal();
  }
});

renderProducts();
renderCart();
