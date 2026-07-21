const products = [
  {
    id: 1,
    name: "Slurp Juice",
    category: "original",
    categoryLabel: "Original",
    price: 89,
    image: "https://cdn.corenexis.com/f/y0laqxn3GTK.png",
    description: "An electrifying blue citrus blend with a tangy lime kick, delivering a crisp, refreshing burst of energy.",
    facts: ["160 mg caffeine", "0 crash formula", "473 mL can"],
    bg: "linear-gradient(135deg, #05070d 0%, #0a1b3f 35%, #0f4aa6 65%, #081018 100%)",
    accent: "#8DFF00"
  },
  {
    id: 2,
    name: "Chud Splash",
    category: "zero",
    categoryLabel: "Zero Sugar",
    price: 95,
    image: "https://cdn.corenexis.com/f/XmtTafl3FrF.png",
    description: "A fiery orange citrus blast with bold tropical notes and an intense energy kick—packed with flavor, not sugar.",
    facts: ["150 mg caffeine", "0 g sugar", "437 mL can"],
    bg: "linear-gradient(135deg, #050505 0%, #2b0c02 30%, #7a1d00 65%, #120300 100%)",
    accent: "#FF7A00"
  },
  {
    id: 3,
    name: "Flow Fizz",
    category: "fruit",
    categoryLabel: "Fruit",
    price: 99,
    image: "https://cdn.corenexis.com/f/cU9VarAmOjO.png",
    description: "A bold fusion of juicy grape, blackberry, and blackcurrant with a smooth, electric finish.",
    facts: ["160 mg caffeine", "13 g sugar", "500 mL can"],
    bg: "linear-gradient(135deg, #050505 0%, #18032b 30%, #4b1386 65%, #09010f 100%)",
    accent: "#A855F7"
  },
  {
    id: 4,
    name: "Awaken Chud",
    category: "original",
    categoryLabel: "Original",
    price: 99,
    image: "https://cdn.corenexis.com/f/JUaNAu5RSjz.png",
    description: "A sharp citrus-lime blast with electric energy and a clean, focused finish.",
    facts: ["160 mg caffeine", "Naturally & artificially flavored", "473 mL can"],
    bg: "linear-gradient(135deg, #050505 0%, #111700 30%, #2f3f00 65%, #060800 100%)",
    accent: "#d8ff00"
  },
  {
    id: 5,
    name: "Mango Bomb",
    category: "fruit",
    categoryLabel: "Fruit",
    price: 95,
    image: "https://cdn.corenexis.com/f/EsGeR4v9aAd.png",
    description: "An explosive blend of ripe mango, juicy pineapple, and passion fruit with a refreshing tropical finish.",
    facts: ["160 mg caffeine", "15 g sugar", "473 mL can"],
    bg: "linear-gradient(135deg, #050505 0%, #3a1800 30%, #ff8c00 65%, #4a2200 100%)",
    accent: "#FFA500",
  },
  {
    id: 6,
    name: "Overworked Dream",
    category: "zero",
    categoryLabel: "Zero Sugar",
    price: 99,
    image: "https://cdn.corenexis.com/f/Kg680pPckju.png",
    description: "A bold berry blast with raspberry, blueberry, and blackberry notes for late-night focus and nonstop energy.",
    facts: ["160 mg caffeine", "14 g sugar", "473 mL can"],
    bg: "linear-gradient(135deg, #050505 0%, #1b0825 30%, #7a1f63 60%, #08121f 100%)",
    accent: "#ff3ea5",
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
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(value);
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term);
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
    const image = card.querySelector(".product-image");
    const placeholder = card.querySelector(".image-placeholder");

    visual.style.background = `radial-gradient(circle, ${product.accent}33, transparent 60%), #0b0b0b`;

    if (product.image) {
      image.src = product.image;
      image.alt = product.name;
      image.loading = "lazy";
      image.decoding = "async";
      article.classList.add("has-image");
      if (placeholder) placeholder.style.display = "none";
    } else {
      article.classList.add("no-image");
      image.removeAttribute("src");
      image.alt = product.name;
      if (placeholder) placeholder.style.display = "grid";
    }

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
  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== productId);
  }

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
      </div>
    `;

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
  visual.style.background = `radial-gradient(circle, ${product.accent}55, transparent 65%), #080808`;
  visual.innerHTML = `<img class="modal-product-image" src="${product.image}" alt="${product.name}">`;

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

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

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
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeModal();
  }
});

renderProducts();
renderCart();
