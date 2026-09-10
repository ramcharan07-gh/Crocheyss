const products = [
  { id: 1, name: "Ghost charm", category: "charms", price: 59, icon: "👻", color: "pink", tag: "best seller", size: "5 cm" },
  { id: 2, name: "Blue bow", category: "accessories", price: 69, icon: "🎀", color: "blue", tag: "new in", size: "8 cm" },
  { id: 3, name: "Pocket octopus", category: "gifts", price: 129, icon: "🐙", color: "yellow", tag: "tiny friend", size: "7 cm" },
  { id: 4, name: "Flower scrunchie", category: "accessories", price: 69, icon: "🌸", color: "sage", tag: "giftable", size: "One size" },
  { id: 5, name: "Red bow keychain", category: "charms", price: 79, icon: "🎀", color: "red", tag: "handmade", size: "6 cm" },
  { id: 6, name: "Sunny mushroom", category: "gifts", price: 149, icon: "🍄", color: "orange", tag: "new in", size: "9 cm" },
  { id: 7, name: "Mini daisy", category: "charms", price: 49, icon: "🌼", color: "cream", tag: "tiny joy", size: "4 cm" },
  { id: 8, name: "Cloud coaster", category: "gifts", price: 89, icon: "☁️", color: "blue", tag: "set of 2", size: "10 cm" }
];

let cart = JSON.parse(localStorage.getItem("cozy-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("cozy-wishlist") || "[]");
let activeCategory = "all";
let activeProductId = null;
const grid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const wishlistDrawer = document.getElementById("wishlistDrawer");
const overlay = document.getElementById("drawerOverlay");
const toast = document.getElementById("toast");

function renderProducts(category = activeCategory) {
  activeCategory = category;
  const query = document.getElementById("productSearch")?.value.trim().toLowerCase() || "";
  const sort = document.getElementById("productSort")?.value || "featured";
  let visibleProducts = products.filter((product) => (category === "all" || product.category === category) && (!query || `${product.name} ${product.category} ${product.tag}`.toLowerCase().includes(query)));
  if (sort === "low") visibleProducts.sort((a, b) => a.price - b.price);
  if (sort === "high") visibleProducts.sort((a, b) => b.price - a.price);
  grid.innerHTML = products
    .filter((product) => visibleProducts.includes(product))
    .map((product, index) => `
      <article class="product-card" style="animation-delay:${index * 70}ms">
        <button class="product-image product-${product.color}" data-details="${product.id}" aria-label="View ${product.name} details">
          <span>${product.icon}</span><span class="badge">${product.tag}</span>
        </button>
        <div class="product-meta"><div><h3>${product.name}</h3><p>handmade with love · ${product.size}</p><strong class="product-price">₹${product.price}</strong></div></div>
        <button class="wishlist-button card-wishlist ${wishlist.includes(product.id) ? "saved" : ""}" data-wishlist="${product.id}">${wishlist.includes(product.id) ? "♥ saved" : "♡ save for later"}</button>
        <button class="buy-button" data-buy="${product.id}">buy now <span>→</span></button>
        <button class="add-button" data-add="${product.id}">add to bundle <span>+</span></button>
      </article>
    `).join("");
  grid.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => addToCart(Number(button.dataset.add))));
  grid.querySelectorAll("[data-buy]").forEach((button) => button.addEventListener("click", () => buyNow(Number(button.dataset.buy))));
  grid.querySelectorAll("[data-details]").forEach((button) => button.addEventListener("click", () => openProduct(Number(button.dataset.details))));
  grid.querySelectorAll("[data-wishlist]").forEach((button) => button.addEventListener("click", () => toggleWishlist(Number(button.dataset.wishlist))));
  if (!visibleProducts.length) grid.innerHTML = `<div class="no-results"><span>🧶</span><p>No cozy pieces found.</p><button class="text-link" id="clearSearch">clear search</button></div>`;
  document.getElementById("clearSearch")?.addEventListener("click", () => { document.getElementById("productSearch").value = ""; renderProducts(); });
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  showToast();
}

function saveCart() {
  localStorage.setItem("cozy-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("drawerCount").textContent = `(${count})`;
  document.getElementById("cartTotal").textContent = `₹${total}`;
  const items = document.getElementById("cartItems");
  items.innerHTML = cart.length ? cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `<div class="cart-row"><div class="cart-row-image">${product.icon}</div><div><h3>${product.name}</h3><p>handmade with love</p><div class="qty-controls"><button data-qty="${product.id}" data-change="-1">−</button><span>${item.quantity}</span><button data-qty="${product.id}" data-change="1">+</button><button data-remove="${product.id}">remove</button></div></div><strong class="cart-row-price">₹${product.price * item.quantity}</strong></div>`;
  }).join("") : `<div class="empty-cart"><span>🧶</span><p>Your cart is waiting<br />for something cozy.</p><a href="#shop" id="startShopping">browse the collection →</a></div>`;
  items.querySelectorAll("[data-qty]").forEach((button) => button.addEventListener("click", () => changeQuantity(Number(button.dataset.qty), Number(button.dataset.change))));
  items.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", () => removeFromCart(Number(button.dataset.remove))));
  document.getElementById("startShopping")?.addEventListener("click", closeCart);
}

function changeQuantity(id, change) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity < 1) cart = cart.filter((entry) => entry.id !== id);
  saveCart();
}

function removeFromCart(id) { cart = cart.filter((item) => item.id !== id); saveCart(); }
function openCart() { cartDrawer.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeCart() { cartDrawer.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; }
function showToast() { toast.classList.add("show"); window.clearTimeout(showToast.timeout); showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2300); }
function toggleWishlist(id) {
  wishlist = wishlist.includes(id) ? wishlist.filter((item) => item !== id) : [...wishlist, id];
  localStorage.setItem("cozy-wishlist", JSON.stringify(wishlist));
  renderWishlist();
  renderProducts();
  toast.innerHTML = wishlist.includes(id) ? "Saved for later <span>♥</span>" : "Removed from your wishlist";
  showToast();
}
function openProduct(id) {
  const product = products.find((entry) => entry.id === id);
  activeProductId = id;
  document.getElementById("modalArt").className = `modal-art product-${product.color}`;
  document.getElementById("modalArt").innerHTML = `<span>${product.icon}</span>`;
  document.getElementById("modalTag").textContent = product.tag;
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalPrice").textContent = `₹${product.price}`;
  document.getElementById("modalDescription").textContent = `${product.name} is a cheerful handmade crochet piece, carefully stitched for gifting, collecting, or adding a little softness to your everyday.`;
  document.getElementById("modalWishlist").textContent = wishlist.includes(id) ? "♥ saved to wishlist" : "♡ save to wishlist";
  document.getElementById("modalBackdrop").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeProduct() { document.getElementById("modalBackdrop").classList.remove("open"); document.body.style.overflow = ""; }
function openCheckout() {
  document.getElementById("checkoutBackdrop").classList.add("open");
  document.body.style.overflow = "hidden";
}
function buyNow(id) {
  cart = [{ id, quantity: 1 }];
  saveCart();
  openCheckout();
}
function setFormStatus(id, message, success = false) {
  const status = document.getElementById(id);
  status.textContent = message;
  status.className = `form-status visible${success ? " success" : ""}`;
}
function renderWishlist() {
  document.getElementById("wishlistCount").textContent = wishlist.length;
  document.getElementById("wishlistDrawerCount").textContent = `(${wishlist.length})`;
  const items = document.getElementById("wishlistItems");
  items.innerHTML = wishlist.length ? wishlist.map((id) => {
    const product = products.find((entry) => entry.id === id);
    return `<div class="wishlist-row"><button class="wishlist-row-art product-${product.color}" data-wishlist-details="${product.id}">${product.icon}</button><div><h3>${product.name}</h3><p>₹${product.price} · handmade with love</p><button class="wishlist-add" data-wishlist-add="${product.id}">add to bundle +</button></div><button class="wishlist-remove" data-wishlist-remove="${product.id}" aria-label="Remove ${product.name} from wishlist">×</button></div>`;
  }).join("") : `<div class="empty-cart"><span>♡</span><p>Save little pieces<br />you love for later.</p><a href="#shop" id="wishlistShop">browse the collection →</a></div>`;
  items.querySelectorAll("[data-wishlist-details]").forEach((button) => button.addEventListener("click", () => { closeWishlist(); openProduct(Number(button.dataset.wishlistDetails)); }));
  items.querySelectorAll("[data-wishlist-add]").forEach((button) => button.addEventListener("click", () => { addToCart(Number(button.dataset.wishlistAdd)); }));
  items.querySelectorAll("[data-wishlist-remove]").forEach((button) => button.addEventListener("click", () => toggleWishlist(Number(button.dataset.wishlistRemove))));
  document.getElementById("wishlistShop")?.addEventListener("click", closeWishlist);
}
function openWishlist() { renderWishlist(); wishlistDrawer.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeWishlist() { wishlistDrawer.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; }

document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-category]").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  renderProducts(button.dataset.category);
}));
document.getElementById("productSearch").addEventListener("input", () => renderProducts());
document.getElementById("productSort").addEventListener("change", () => renderProducts());
document.getElementById("searchButton").addEventListener("click", () => {
  document.getElementById("productSearch").focus();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("closeModal").addEventListener("click", closeProduct);
document.getElementById("modalBackdrop").addEventListener("click", (event) => { if (event.target.id === "modalBackdrop") closeProduct(); });
document.getElementById("modalBuy").addEventListener("click", () => {
  closeProduct();
  buyNow(activeProductId);
});
document.getElementById("modalAdd").addEventListener("click", () => { addToCart(activeProductId); closeProduct(); });
document.getElementById("modalWishlist").addEventListener("click", () => { toggleWishlist(activeProductId); openProduct(activeProductId); });
document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("wishlistButton").addEventListener("click", openWishlist);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("closeWishlist").addEventListener("click", closeWishlist);
overlay.addEventListener("click", () => { closeCart(); closeWishlist(); });
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    toast.textContent = "Add something cozy before checking out";
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
      toast.classList.remove("show");
      toast.innerHTML = 'Added to your cozy bundle <span>♥</span>';
    }, 2300);
    return;
  }
  closeCart();
  openCheckout();
});
document.getElementById("closeCheckout").addEventListener("click", () => { document.getElementById("checkoutBackdrop").classList.remove("open"); document.body.style.overflow = ""; });
document.getElementById("checkoutBackdrop").addEventListener("click", (event) => {
  if (event.target.id === "checkoutBackdrop") { document.getElementById("checkoutBackdrop").classList.remove("open"); document.body.style.overflow = ""; }
});
document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(event.currentTarget);
  const items = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return { name: product.name, quantity: item.quantity, price: product.price };
  });
  const submit = formElement.querySelector("button[type=submit]");
  submit.disabled = true;
  setFormStatus("checkoutStatus", "Sending your order request...");
  fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), address: form.get("address"), note: form.get("note"), items }) })
    .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Order could not be sent"); return result; })
    .then((result) => {
      localStorage.setItem("cozy-last-order", JSON.stringify({ createdAt: new Date().toISOString(), customer: form.get("name"), orderId: result.orderId, items: cart }));
      cart = [];
      saveCart();
      formElement.reset();
      setFormStatus("checkoutStatus", `Order ${result.orderId} received. Check your email for confirmation.`, true);
      toast.innerHTML = "Order received with love <span>♥</span>";
      showToast();
    })
    .catch((error) => setFormStatus("checkoutStatus", error.message || "Your order could not be sent. Please try again."))
    .finally(() => { submit.disabled = false; });
});
document.getElementById("customOrderButton").addEventListener("click", () => { document.getElementById("customOrderBackdrop").classList.add("open"); document.body.style.overflow = "hidden"; });
document.getElementById("closeCustomOrder").addEventListener("click", () => { document.getElementById("customOrderBackdrop").classList.remove("open"); document.body.style.overflow = ""; });
document.getElementById("customOrderBackdrop").addEventListener("click", (event) => { if (event.target.id === "customOrderBackdrop") { event.currentTarget.classList.remove("open"); document.body.style.overflow = ""; } });
document.getElementById("customOrderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const submit = formElement.querySelector("button[type=submit]");
  submit.disabled = true;
  setFormStatus("customOrderStatus", "Sending your custom request...");
  fetch("/api/custom-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) })
    .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Request could not be sent"); return result; })
    .then((result) => { formElement.reset(); setFormStatus("customOrderStatus", `Request ${result.requestId} received. We’ll email your quote soon.`, true); })
    .catch((error) => setFormStatus("customOrderStatus", error.message || "Your request could not be sent. Please try again."))
    .finally(() => { submit.disabled = false; });
});
document.getElementById("skipIntro").addEventListener("click", () => document.getElementById("intro").classList.add("is-hidden"));
window.setTimeout(() => document.getElementById("intro").classList.add("is-hidden"), 3200);

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .12 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
renderProducts();
renderCart();
renderWishlist();
