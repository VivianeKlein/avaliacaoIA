const products = [
  { id: "quintal-burger", name: "Burger do Quintal", price: 32.90, description: "Blend artesanal, queijo prato, alface, tomate e molho da casa.", category: "Lanches", icon: "🍔" },
  { id: "smash-duplo", name: "Smash Duplo", price: 35.90, description: "Dois discos smash, cheddar cremoso e cebola caramelizada.", category: "Lanches", icon: "🍔" },
  { id: "burger-veg", name: "Burger Veggie", price: 29.90, description: "Hambúrguer de grão-de-bico, rúcula e maionese de ervas.", category: "Lanches", icon: "🥬" },
  { id: "batata-rustica", name: "Batata Rústica", price: 16.00, description: "Batatas douradas com alecrim e um toque de páprica.", category: "Acompanhamentos", icon: "🍟" },
  { id: "aneis-cebola", name: "Anéis de Cebola", price: 18.00, description: "Crocantes por fora, macios por dentro. Acompanha molho.", category: "Acompanhamentos", icon: "🧅" },
  { id: "limonada", name: "Limonada da Casa", price: 9.50, description: "Limão fresquinho, água gelada e o equilíbrio perfeito.", category: "Bebidas", icon: "🍋" }
];

const cart = new Map();
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const productGrid = document.getElementById("product-grid");
const categoryFilters = document.getElementById("category-filters");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartMessage = document.getElementById("cart-message");
const confirmationDialog = document.getElementById("confirmation-dialog");
let activeCategory = "Todos";

function renderFilters() {
  const categories = ["Todos", ...new Set(products.map((product) => product.category))];
  categoryFilters.innerHTML = categories.map((category) => `
    <button class="filter-button" type="button" data-category="${category}" aria-pressed="${category === activeCategory}">
      ${category}
    </button>
  `).join("");
}

function renderProducts() {
  const visibleProducts = activeCategory === "Todos"
    ? products
    : products.filter((product) => product.category === activeCategory);

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-top">
        <span class="product-icon" aria-hidden="true">${product.icon}</span>
        <span class="product-category">${product.category}</span>
      </div>
      <h3>${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-bottom">
        <span class="product-price">${currency.format(product.price)}</span>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Adicionar ${product.name} ao pedido">
          <span aria-hidden="true">＋</span> Adicionar
        </button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const entries = [...cart.entries()];
  const itemCount = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * quantity;
  }, 0);

  cartCount.textContent = itemCount;
  cartCount.setAttribute("aria-label", `${itemCount} ${itemCount === 1 ? "item" : "itens"}`);
  cartTotal.textContent = currency.format(total);

  if (entries.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon" aria-hidden="true">🛍️</span>
        <strong>Seu pedido está vazio</strong>
        <p>Adicione algo gostoso do cardápio.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `
      <div class="cart-item">
        <div>
          <p class="cart-item-name">${product.name}</p>
          <span class="cart-item-subtotal">${currency.format(product.price * quantity)}</span>
        </div>
        <div class="cart-item-controls" aria-label="Quantidade de ${product.name}">
          <button class="quantity-button" type="button" data-decrease="${id}" aria-label="Diminuir ${product.name}">−</button>
          <span class="quantity-number" aria-live="polite">${quantity}</span>
          <button class="quantity-button" type="button" data-increase="${id}" aria-label="Aumentar ${product.name}">＋</button>
          <button class="remove-button" type="button" data-remove="${id}" aria-label="Remover ${product.name} do pedido">Remover</button>
        </div>
      </div>
    `;
  }).join("");
}

function changeQuantity(id, amount) {
  const nextQuantity = (cart.get(id) || 0) + amount;
  if (nextQuantity <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, nextQuantity);
  }
  cartMessage.textContent = "";
  renderCart();
}

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  changeQuantity(button.dataset.add, 1);
  cartMessage.textContent = `${products.find((product) => product.id === button.dataset.add).name} adicionado ao pedido.`;
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.increase) changeQuantity(button.dataset.increase, 1);
  if (button.dataset.decrease) changeQuantity(button.dataset.decrease, -1);
  if (button.dataset.remove) {
    cart.delete(button.dataset.remove);
    cartMessage.textContent = "Item removido do pedido.";
    renderCart();
  }
});

document.getElementById("checkout-button").addEventListener("click", () => {
  if (cart.size === 0) {
    cartMessage.textContent = "Seu pedido está vazio. Adicione pelo menos um item antes de confirmar.";
    return;
  }

  const entries = [...cart.entries()];
  const total = entries.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * quantity;
  }, 0);

  document.getElementById("confirmation-list").innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `
      <div class="confirmation-line">
        <span>${quantity}× ${product.name}</span>
        <span>${currency.format(product.price * quantity)}</span>
      </div>
    `;
  }).join("");
  document.getElementById("confirmation-total").textContent = currency.format(total);
  cart.clear();
  cartMessage.textContent = "";
  renderCart();
  confirmationDialog.showModal();
});

document.getElementById("close-confirmation").addEventListener("click", () => {
  confirmationDialog.close();
});

renderFilters();
renderProducts();
renderCart();
