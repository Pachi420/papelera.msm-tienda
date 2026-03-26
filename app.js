// Papelera Pro - Carrito 100% Funcional
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
let cantidades = JSON.parse(localStorage.getItem('cantidades') || '{}');

document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  createNav();
  document.getElementById('buscador').addEventListener('input', searchProducts);
  document.getElementById('carrito-icono').onclick = toggleCart;
  showCategory(0);
  updateCartDisplay();
}

function createNav() {
  const nav = document.getElementById('categorias');
  nav.innerHTML = '';
  productos.forEach((category, index) => {
    const btn = document.createElement('button');
    btn.textContent = category.nombre;
    btn.onclick = () => showCategory(index);
    nav.appendChild(btn);
  });
}

let currentProducts = [];
function showCategory(index) {
  currentProducts = productos[index].items;
  renderProducts(currentProducts);
}

function renderProducts(products) {
  const container = document.getElementById('catalogo');
  container.innerHTML = `
    <div class="grid">
      ${products.map(product => {
        const id = btoa(product.nombre + product.precio);
        const qty = cantidades[id] || 0;
        return `
          <div class="card">
            <img src="${product.img}" onerror="this.src='https://via.placeholder.com/150x100?text=IMG'">
            <h4>${product.nombre}</h4>
            <p>$${product.precio.toLocaleString()}</p>
            <div class="controles">
              <button onclick="changeQty('${id}', -1)">-</button>
              <span class="qty">${qty}</span>
              <button onclick="changeQty('${id}', 1)">+</button>
            </div>
            <button onclick="addToCart('${product.nombre}', ${product.precio}, '${id}')" class="btn-agregar">
              🛒 Agregar
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function changeQty(id, delta) {
  let qty = (cantidades[id] || 0) + delta;
  qty = Math.max(0, qty);
  if (qty === 0) {
    delete cantidades[id];
  } else {
    cantidades[id] = qty;
  }
  localStorage.setItem('cantidades', JSON.stringify(cantidades));
  renderProducts(currentProducts);
}

function searchProducts(e) {
  const query = e.target.value.toLowerCase();
  if (!query) {
    showCategory(0);
    return;
  }
  const results = productos.flatMap(cat => 
    cat.items.filter(p => p.nombre.toLowerCase().includes(query))
  );
  renderProducts(results);
}

function toggleCart() {
  const cart = document.getElementById('carrito');
  cart.classList.toggle('oculto');
  if (!cart.classList.contains('oculto')) {
    updateCartDisplay();
  }
}

function addToCart(name, price, id) {
  const qty = cantidades[id] || 0;
  if (qty === 0) return;
  
  for (let i = 0; i < qty; i++) {
    carrito.push({
      id: Date.now() + Math.random(),
      name: name,
      price: Number(price)
    });
  }
  
  delete cantidades[id];
  localStorage.setItem('cantidades', JSON.stringify(cantidades));
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  toggleCart();
  updateCartDisplay();
  renderProducts(currentProducts);
}

function updateCartDisplay() {
  const itemsContainer = document.getElementById('items-carrito');
  const contador = document.getElementById('contador');
  const totalContainer = document.getElementById('total-compra');
  
  let total = 0;
  let html = '';
  
  if (carrito.length === 0) {
    html = '<div style="padding:30px;text-align:center;color:#888"><p>🛒 Carrito vacío</p><p>Agrega productos para comprar</p></div>';
  } else {
    // Agrupar productos iguales
    const groupedCart = {};
    carrito.forEach(item => {
      const key = item.name + '-' + item.price;
      groupedCart[key] = (groupedCart[key] || 0) + 1;
    });

    Object.entries(groupedCart).forEach(([key, count], groupIndex) => {
      const [name, priceStr] = key.split('-');
      const price = Number(priceStr);
      total += price * count;
      html += `
        <div class="item-carrito">
          <div class="item-info">
            <strong>${name} <span style="color:#f39c12;font-size:1.1em;">x${count}</span></strong>
            <div>$${Number(price).toLocaleString()} c/u</div>
            <div style="font-weight:600;color:#27ae60;font-size:1.2em;">Total: $${(price * count).toLocaleString()}</div>
          </div>
          <button onclick="removeGroup('${key}')" class="btn-quitar">🗑️</button>
        </div>
      `;
    });
    html += `
      <div class="total-section">
        <div class="total-price">Total: $${total.toLocaleString()}</div>
        <button onclick="buyWhatsApp()" class="btn-comprar">📱 Comprar WhatsApp</button>
      </div>
    `;
  }
  
  itemsContainer.innerHTML = html;
  contador.textContent = carrito.length || 0;
}

function removeGroup(key) {
  carrito = carrito.filter(item => !(item.name + '-' + item.price === key));
  localStorage.setItem('carrito', JSON.stringify(carrito));
  updateCartDisplay();
}

function removeFromCart(index) {
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  updateCartDisplay();
}

function buyWhatsApp() {
  if (carrito.length === 0) return;
  
  // Group items like cart display
  const groupedCart = {};
  carrito.forEach(item => {
    const key = item.name + '-' + item.price;
    groupedCart[key] = (groupedCart[key] || 0) + 1;
  });

  let total = 0;
  Object.entries(groupedCart).forEach(([key]) => {
    const [, priceStr] = key.split('-');
    const price = Number(priceStr);
    const count = groupedCart[key];
    total += price * count;
  });

  let mensaje = 'Productos:';
  Object.entries(groupedCart).forEach(([key]) => {
    const [name] = key.split('-');
    const count = groupedCart[key];
    mensaje += ` "${name} x${count}"`;
  });
  mensaje += `\n"Total de la compra: $${total.toLocaleString()}"\n\n"Nombre:"\n"Apellido:"`;
  
  const phone = '5491160246291'; // +54 9 11 6024-6291
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// Inicializar carrito si existe
updateCartDisplay();
