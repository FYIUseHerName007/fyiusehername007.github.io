
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('#contact-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (validateForm()) {
            alert('Formulaire soumis avec succès!');
            form.reset();
            document.querySelectorAll('input, textarea').forEach(el => {
                el.classList.remove('is-valid');
            });
        }

        function validateForm() {
            let isValid = true;
            const name = document.querySelector('#InputNom');
            if (name.value.length < 3) {
                showError(name, "Veuillez entrer un minimum de 3 lettres");
                isValid = false;
            }
            else {
                showSuccess(name);
            }
            const email = document.querySelector('#InputEmail');
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email.value)) {
                showError(email, "Veuillez entrer votre courriel dans le format email@example.com");
                isValid = false;
            }
            else {
                showSuccess(email);
            }

            const message = document.querySelector('#InputMessage');

            if (message.value.length < 10) {
                showError(message, "Veuillez entrer au minimum 10 caractères pour votre message.");
                isValid = false;
            }
            else {
                showSuccess(message);
            }

            function showError(input, message) {
                const feedback = input.nextElementSibling;
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                feedback.textContent = message;
            }
            function showSuccess(input) {
                const feedback = input.nextElementSibling;
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                feedback.textContent = "";
            }
            return isValid;
        }
    });
});

const CART_KEY = "panier";

const grid = document.getElementById("productsGrid");
const countEl = document.getElementById("productsCount");

const cartCountEl = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");

const modalTitle = document.getElementById("modalTitle");
const modalImg = document.getElementById("modalImg");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalAddBtn = document.getElementById("modalAddToCartBtn");

let currentModalProduct = null;

document.getElementById("year").textContent = new Date().getFullYear();
function formatPriceCAD(price) {
    return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(price);
}
function getCart() {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
}
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            titre: product.titre,
            prix: product.prix,
            image: product.image,
            qty: 1
        });
    }
    saveCart(cart);
    renderCart();
}
function removeOneFromCart(productId) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty -= 1;
    const newCart = item.qty <= 0 ? cart.filter(i => i.id !== productId) : cart;
    saveCart(newCart);
    renderCart();
}
function clearCart() {
    localStorage.removeItem(CART_KEY);
    renderCart();
}
function createProductCard(p) {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    col.innerHTML = `
    <div class="card black-borderGold h-100 shadow-sm">
      <img src="${p.image}" class="card-img-top" alt="${p.titre}">
      <div class="card-body  d-flex flex-column">
        <h5 class="card-title titleText">${p.titre}</h5>
        <p class="card-text ">${p.descriptionCourte}</p>

        <div class="mt-auto d-flex justify-content-between align-items-center">
          <span class="price regularText">${formatPriceCAD(p.prix)}</span>

          <div class="d-flex gap-2">
            <button class="btn btn-gold-premiumSmall btn-sm js-add">Ajouter au panier</button>
            <button class="btn btn-gold-premiumSmall btn-sm js-details"
              data-bs-toggle="modal"
              data-bs-target="#productDetailsModal">
              Détails
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

    col.querySelector(".js-add").addEventListener("click", () => {
        addToCart(p);
        const btn = col.querySelector(".js-add");
        btn.textContent = "Ajouté ✓";
        setTimeout(() => (btn.textContent = "Ajouter au panier"), 800);
    });
    col.querySelector(".js-details").addEventListener("click", () => {
        openDetailsModal(p);
    });
    return col;
}

async function loadProducts() {
    try {
        const res = await fetch("./produits.json");
        if (!res.ok) throw new Error("Impossible de charger produits.json");
        const products = await res.json();
        countEl.textContent = `${products.length} produits`;
        grid.innerHTML = "";
        products.forEach(p => grid.appendChild(createProductCard(p)));
    } catch (err) {
        console.error(err);
        grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Erreur: produits non chargés. Vérifie le chemin <strong>./produits.json</strong> et lance un serveur local.
        </div>
      </div>
    `;
    }
}

function openDetailsModal(p) {
    currentModalProduct = p;
    modalTitle.textContent = p.titre;
    modalDesc.textContent = p.descriptionLongue;
    modalPrice.textContent = formatPriceCAD(p.prix);
    modalImg.src = p.image;
    modalImg.alt = p.titre;
    modalAddBtn.textContent = "Ajouter au panier";
    let fermer = document.querySelector('.fermerPanier')
}

modalAddBtn.addEventListener("click", () => {
    if (!currentModalProduct) return;
    addToCart(currentModalProduct);
    modalAddBtn.textContent = "Ajouté ✓";
    setTimeout(() => (modalAddBtn.textContent = "Ajouter au panier"), 900);
});

function renderCart() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = cart.reduce((sum, item) => sum + item.qty * item.prix, 0);
    cartCountEl.textContent = count;
    cartTotalEl.textContent = formatPriceCAD(total);
    if (cart.length === 0) {
        cartItemsEl.innerHTML = `<p class="mb-0">Ton panier est vide.</p>`;
        return;
    }
    cartItemsEl.innerHTML = cart.map(item => `
    <div class="d-flex gap-3 align-items-center py-2">
      <img src="${item.image}" alt="${item.titre}" width="64" height="48" class="rounded object-fit-cover">
      <div class="flex-grow-1">
        <div class="titleText">${item.titre}</div>
        <div class="regularText">
          ${formatPriceCAD(item.prix)} × ${item.qty}
        </div>
      </div>
      <div class="d-flex flex-column gap-2">
        <button class="btn btnPanier btn-sm js-minus" data-id="${item.id}">-</button>
        <button class="btn btnPanier btn-sm js-plus" data-id="${item.id}">+</button>
      </div>
    </div>
  `).join("");

    cartItemsEl.querySelectorAll(".js-plus").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item) addToCart(item);
        });
    });
    cartItemsEl.querySelectorAll(".js-minus").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            removeOneFromCart(id);
        });
    });
}
const backToTopBtn = document.getElementById("backToTopBtn");
function toggleBackToTopButton() {
    if (!backToTopBtn) return;

    if (window.scrollY > 100) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
}
if (backToTopBtn) {
    window.addEventListener("scroll", toggleBackToTopButton);
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
    toggleBackToTopButton();
}

clearCartBtn.addEventListener("click", clearCart);
loadProducts();
renderCart();