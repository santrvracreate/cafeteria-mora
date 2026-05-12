// =============================================
// CAFETERÍA MORA — app.js  (versión corregida)
// =============================================
// ÍNDICE DE SECCIONES:
//  1. Datos de productos
//  2. Estado del carrito + localStorage
//  3. Referencias al DOM
//  4. Navegación SPA
//  5. Menú hamburguesa (móvil)
//  6. Toast (notificación flotante)
//  7. Modal de detalles del producto
//  8. Badge del carrito
//  9. Renderizar carrito
// 10. Renderizar productos
// 11. Inicialización
// =============================================

// ══════════════════════════════════════════════
// 1. DATOS DE PRODUCTOS
//    Array central con toda la información de
//    cada ítem del menú. Si quieres agregar un
//    producto nuevo, solo añade un objeto aquí.
// ══════════════════════════════════════════════
const productos = [
  {
    id: 1,
    nombre: "Café Americano",
    descripcion: "Café negro clásico",
    precio: 12,
    detalles:
      "Preparado con granos 100% arábica, tostado medio. Sabor limpio y equilibrado.",
    imagen: "img/cafe-americano.jpg",
  },
  {
    id: 2,
    nombre: "Frappe de Chocolate",
    descripcion: "Frappe frío a base de chocolate puro",
    precio: 15,
    detalles:
      "Bebida helada con chocolate belga y crema batida. Perfecta para el calor.",
    imagen: "img/Frappe-chocolate.jpg",
  },
  {
    id: 3,
    nombre: "Dona Rellena",
    descripcion: "Dona rellena de crema pastelera",
    precio: 10,
    detalles:
      "Dona esponjosa con crema pastelera casera. Receta artesanal de la casa.",
    imagen: "img/dona-rellena.jpg",
  },
  {
    id: 4,
    nombre: "Rollo de Canela",
    descripcion: "Rollo extra crujiente de canela",
    precio: 10,
    detalles:
      "Masa suave con canela y glaseado de queso crema. Horneado fresco cada mañana.",
    imagen: "img/rollo-canela.jpg",
  },
  {
    id: 5,
    nombre: "Latte Caramel",
    descripcion: "Café latte con caramelo y espuma",
    precio: 18,
    detalles:
      "Espresso con leche vaporizada y caramelo artesanal. Dulce y cremoso.",
    imagen: "img/latte-caramel.jpg",
  },
  {
    id: 6,
    nombre: "Frappuccino",
    descripcion: "Bebida de café frío licuado con hielo y leche",
    precio: 18,
    detalles:
      "Café helado licuado con consistencia cremosa similar a un granizado. Irresistible.",
    imagen: "img/Frapuchino.jpg",
  },
];

// ══════════════════════════════════════════════
// 2. ESTADO DEL CARRITO + LOCALSTORAGE
//
//    El carrito es un array de objetos. Cada
//    objeto es una copia del producto + cantidad.
//    Ejemplo: { id:1, nombre:"...", precio:12, cantidad:2 }
//
//    CORRECCIÓN: guardarCarrito() ahora se llama
//    en TODAS las funciones que modifican el carrito,
//    para que los datos persistan al recargar la página.
// ══════════════════════════════════════════════
let carrito = [];

/**
 * Serializa el carrito como JSON y lo guarda en localStorage.
 * Debe llamarse SIEMPRE que el carrito cambie.
 */
function guardarCarrito() {
  localStorage.setItem("mora_carrito", JSON.stringify(carrito));
}

/**
 * Lee el carrito guardado en localStorage.
 * Se ejecuta una sola vez al iniciar la app.
 * Si no hay datos guardados, el carrito queda vacío ([]).
 */
function cargarCarrito() {
  const carritoGuardado = localStorage.getItem("mora_carrito");
  if (carritoGuardado) {
    try {
      // El try/catch evita que un JSON corrupto rompa la app
      carrito = JSON.parse(carritoGuardado);
    } catch (e) {
      console.warn("Carrito corrupto en localStorage, se reinicia.", e);
      carrito = [];
    }
  }
}

// ══════════════════════════════════════════════
// 3. REFERENCIAS AL DOM
//
//    Guardamos todas las referencias una sola vez
//    al inicio. Es más eficiente que hacer
//    querySelector() cada vez que las necesitamos.
// ══════════════════════════════════════════════
const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");
const cartCount = document.getElementById("cart-count");
const cartContainer = document.getElementById("cart-container");
const productsContainer = document.getElementById("products-container");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navLinks");
const cartBtn = document.getElementById("cart-btn");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-message");
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalPrice = document.getElementById("modal-price");

// CORRECCIÓN: referencia al botón "Agregar" del modal,
// que en la versión original no existía.
const modalAddBtn = document.getElementById("modal-add-btn");

// ══════════════════════════════════════════════
// 4. NAVEGACIÓN SPA (Single Page Application)
//
//    Solo una <section class="view"> es visible
//    a la vez. Las demás están ocultas con CSS.
//    Navegamos mostrando/ocultando con la clase "active".
// ══════════════════════════════════════════════

/**
 * Muestra la vista indicada y oculta las demás.
 * @param {string} vista - Nombre de la vista (ej: "menu", "carrito", "inicio")
 */
function navegarA(vista) {
  // Ocultar TODAS las vistas quitando la clase "active"
  views.forEach(function (v) {
    v.classList.remove("active");
  });

  // Mostrar solo la vista que corresponde al parámetro
  const target = document.getElementById("view-" + vista);
  if (target) {
    target.classList.add("active");
  } else {
    console.warn("Vista no encontrada: view-" + vista);
  }

  // Marcar el link del navbar como activo
  navLinks.forEach(function (link) {
    link.classList.toggle("active", link.dataset.view === vista);
  });

  // Cerrar el menú hamburguesa si estaba abierto (móvil)
  navMenu.classList.remove("open");

  // Llevar la pantalla al inicio de la página
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Clic en cualquier link del navbar → navegar a su vista
navLinks.forEach(function (enlace) {
  enlace.addEventListener("click", function (e) {
    e.preventDefault(); // evitar recarga de página
    navegarA(this.dataset.view);
  });
});

// Botón del carrito en el navbar → ir a la vista "carrito"
cartBtn.addEventListener("click", function () {
  navegarA("carrito");
});

// Botón CTA del hero ("Ver Menú") → ir a la vista "menu"
const heroCta = document.querySelector(".hero-cta");
if (heroCta) {
  heroCta.addEventListener("click", function () {
    navegarA(this.dataset.view);
  });
}

// ══════════════════════════════════════════════
// 5. MENÚ HAMBURGUESA (móvil)
//
//    En pantallas pequeñas, el navbar se colapsa.
//    El botón hamburguesa muestra/oculta los links.
// ══════════════════════════════════════════════

// Alternar menú al hacer clic en el botón hamburguesa
hamburger.addEventListener("click", function () {
  navMenu.classList.toggle("open");
});

// Cerrar menú si el usuario hace clic FUERA del navbar
document.addEventListener("click", function (e) {
  const clickDentroDeNavbar =
    hamburger.contains(e.target) || navMenu.contains(e.target);
  if (!clickDentroDeNavbar) {
    navMenu.classList.remove("open");
  }
});

// ══════════════════════════════════════════════
// 6. TOAST — Notificación flotante
//
//    Reemplaza los alert() nativos del browser.
//    Aparece en pantalla 2.5 segundos y desaparece.
//    Si se llama de nuevo antes de que termine,
//    reinicia el temporizador (no se apilan toasts).
// ══════════════════════════════════════════════
let toastTimer = null;

/**
 * Muestra un mensaje flotante temporal en pantalla.
 * @param {string} mensaje - Texto a mostrar al usuario.
 */
function mostrarToast(mensaje) {
  toastMsg.textContent = mensaje;
  toast.classList.add("show");

  // Si ya había un toast activo, cancelar su temporizador
  if (toastTimer) clearTimeout(toastTimer);

  // Programar el ocultamiento después de 2.5 segundos
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
    toastTimer = null;
  }, 2500);
}

// ══════════════════════════════════════════════
// 7. MODAL — Detalles del producto
//
//    Al hacer clic en "Ver detalles" de una tarjeta,
//    se abre un modal con info completa del producto.
//
//    CORRECCIÓN: ahora el modal tiene un botón
//    "Agregar al carrito" funcional. En la versión
//    original ese botón no existía, el usuario no
//    podía agregar desde el modal.
//
//    Guardamos el producto actual del modal en una
//    variable para usarla en el botón de agregar.
// ══════════════════════════════════════════════
let productoEnModal = null; // referencia al producto que está en el modal

/**
 * Abre el modal con la información del producto recibido.
 * @param {Object} producto - Objeto del producto a mostrar.
 */
function abrirModal(producto) {
  productoEnModal = producto; // guardar referencia para el botón de agregar

  // Rellenar los campos del modal con los datos del producto
  modalImg.src = producto.imagen;
  modalImg.alt = producto.nombre;
  modalTitle.textContent = producto.nombre;
  modalDesc.textContent = producto.detalles;
  modalPrice.textContent = "Bs. " + producto.precio;

  // Mostrar el modal añadiendo la clase "open"
  modalOverlay.classList.add("open");

  // Bloquear el scroll del body mientras el modal esté abierto
  document.body.style.overflow = "hidden";
}

/**
 * Cierra el modal y restaura el scroll de la página.
 */
function cerrarModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
  productoEnModal = null; // limpiar referencia
}

// Cerrar con el botón ✕ del modal
modalClose.addEventListener("click", cerrarModal);

// Cerrar al hacer clic en el FONDO OSCURO (fuera del contenido del modal)
modalOverlay.addEventListener("click", function (e) {
  if (e.target === modalOverlay) cerrarModal();
});

// Cerrar con la tecla Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") cerrarModal();
});

// CORRECCIÓN: botón "Agregar al carrito" dentro del modal.
// En la versión original este evento no existía.
if (modalAddBtn) {
  modalAddBtn.addEventListener("click", function () {
    if (!productoEnModal) return;

    // Reutilizamos la lógica de agregar (igual que en las tarjetas)
    agregarAlCarrito(productoEnModal);

    // Cerrar el modal después de agregar
    cerrarModal();
  });
}

// ══════════════════════════════════════════════
// 8. BADGE DEL CARRITO
//
//    El número rojo sobre el ícono del carrito
//    muestra la cantidad TOTAL de ítems (sumando
//    las cantidades de cada producto).
//    Tiene una animación "bump" al actualizarse.
// ══════════════════════════════════════════════

/**
 * Recalcula y actualiza el número del badge del carrito.
 * Debe llamarse cada vez que el carrito cambia.
 */
function actualizarContador() {
  const total = carrito.reduce(function (acc, item) {
    return acc + item.cantidad;
  }, 0);

  cartCount.textContent = total;

  // Animación "bump": quitamos la clase, forzamos reflow,
  // y la volvemos a añadir para que el CSS la ejecute de nuevo.
  cartCount.classList.remove("bump");
  void cartCount.offsetWidth; // este void fuerza al navegador a recalcular el layout
  cartCount.classList.add("bump");
}

// ══════════════════════════════════════════════
// 9. RENDERIZAR CARRITO
//
//    Genera y muestra el HTML del carrito completo:
//    lista de ítems + controles de cantidad +
//    resumen de pago + botones de acción.
//
//    CORRECCIÓN: guardarCarrito() se llama en cada
//    acción que modifica el carrito (aumentar,
//    disminuir, eliminar, vaciar, confirmar pedido).
// ══════════════════════════════════════════════

/**
 * Dibuja el carrito en la vista "carrito".
 * Si está vacío muestra un mensaje con botón al menú.
 * Si tiene ítems, muestra la lista y el resumen.
 */
function renderizarCarrito() {
  if (!cartContainer) return;

  // ── Caso 1: carrito vacío ──
  if (carrito.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <button class="btn btn-primary" data-view="menu">Ver el menú</button>
      </div>
    `;

    // El botón "Ver el menú" también navega a la vista del menú
    const btnMenu = cartContainer.querySelector("[data-view='menu']");
    if (btnMenu) {
      btnMenu.addEventListener("click", function () {
        navegarA("menu");
      });
    }
    return; // salir, no hay nada más que renderizar
  }

  // ── Caso 2: carrito con productos ──

  // Calcular el total a pagar
  const subtotal = carrito.reduce(function (acc, item) {
    return acc + item.precio * item.cantidad;
  }, 0);

  // Construir el HTML de cada ítem del carrito
  let itemsHTML = "";
  carrito.forEach(function (item) {
    const itemTotal = item.precio * item.cantidad;
    itemsHTML += `
      <div class="cart-item" data-id="${item.id}">
        <img
          src="${item.imagen}"
          alt="${item.nombre}"
          class="cart-item-img"
          onerror="this.src='https://placehold.co/64x64/4e3629/white?text=☕'"
        />
        <div class="cart-item-info">
          <p>${item.nombre}</p>
          <small>Bs. ${item.precio} c/u</small>
        </div>
        <div class="qty-controls">
          <button class="qty-btn btn-decrease" data-id="${item.id}" aria-label="Disminuir cantidad">−</button>
          <span class="qty-value">${item.cantidad}</span>
          <button class="qty-btn btn-increase" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
        </div>
        <span class="cart-item-price">Bs. ${itemTotal}</span>
        <button class="btn-remove" data-id="${item.id}" aria-label="Eliminar producto">✕</button>
      </div>
    `;
  });

  // Insertar HTML completo del carrito
  cartContainer.innerHTML = `
    <div class="cart-layout">
      <div class="cart-list">
        ${itemsHTML}
      </div>
      <div class="cart-summary">
        <h3>Resumen del pedido</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>Bs. ${subtotal}</span>
        </div>
        <div class="summary-row">
          <span>Envío</span>
          <span>Gratis</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>Bs. ${subtotal}</span>
        </div>
        <button class="btn-checkout">Confirmar pedido 🎉</button>
        <button class="btn-clear">Vaciar carrito</button>
      </div>
    </div>
  `;

  // ── Evento: Aumentar cantidad (+) ──
  // Si el producto ya existe en el carrito, solo sube su cantidad.
  cartContainer.querySelectorAll(".btn-increase").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      const item = carrito.find(function (p) {
        return p.id === id;
      });
      if (item) {
        item.cantidad += 1;
        guardarCarrito(); // CORRECCIÓN: persistir cambio
        actualizarContador();
        renderizarCarrito();
      }
    });
  });

  // ── Evento: Disminuir cantidad (-) ──
  // Si la cantidad es 1 y se presiona "−", el producto se elimina del carrito.
  cartContainer.querySelectorAll(".btn-decrease").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      const item = carrito.find(function (p) {
        return p.id === id;
      });
      if (item) {
        if (item.cantidad > 1) {
          item.cantidad -= 1;
        } else {
          // Cantidad llega a 0 → eliminar el ítem del array
          carrito = carrito.filter(function (p) {
            return p.id !== id;
          });
          mostrarToast("Producto eliminado del carrito");
        }
        guardarCarrito(); // CORRECCIÓN: persistir cambio
        actualizarContador();
        renderizarCarrito();
      }
    });
  });

  // ── Evento: Eliminar producto (✕) ──
  // Elimina el producto del carrito sin importar la cantidad.
  cartContainer.querySelectorAll(".btn-remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      carrito = carrito.filter(function (p) {
        return p.id !== id;
      });
      guardarCarrito(); // CORRECCIÓN: persistir cambio
      actualizarContador();
      renderizarCarrito();
      mostrarToast("Producto eliminado del carrito");
    });
  });

  // ── Evento: Vaciar carrito ──
  // Elimina TODOS los productos del carrito de una vez.
  const btnClear = cartContainer.querySelector(".btn-clear");
  if (btnClear) {
    btnClear.addEventListener("click", function () {
      carrito = [];
      guardarCarrito(); // CORRECCIÓN: persistir cambio
      actualizarContador();
      renderizarCarrito();
      mostrarToast("Carrito vaciado");
    });
  }

  // ── Evento: Confirmar pedido ──
  // Simula la confirmación del pedido y vacía el carrito.
  // Aquí podrías conectar a un backend o pasarela de pago.
  const btnCheckout = cartContainer.querySelector(".btn-checkout");
  if (btnCheckout) {
    btnCheckout.addEventListener("click", function () {
      mostrarToast("¡Pedido confirmado! Gracias por tu compra 🎉");
      carrito = [];
      guardarCarrito(); // CORRECCIÓN: persistir cambio
      actualizarContador();
      renderizarCarrito();
    });
  }
}

// ══════════════════════════════════════════════
// 10. RENDERIZAR PRODUCTOS
//
//     Genera dinámicamente las tarjetas del menú
//     a partir del array "productos".
//     Cada tarjeta tiene dos botones:
//       • "+ Agregar"   → agrega al carrito
//       • "Ver detalles" → abre el modal
//
//     CORRECCIÓN: la lógica de agregar al carrito
//     fue extraída a la función agregarAlCarrito()
//     para poder reutilizarla también en el modal.
// ══════════════════════════════════════════════

/**
 * Agrega un producto al carrito o incrementa su cantidad
 * si ya estaba en él. Luego guarda, actualiza y notifica.
 * @param {Object} producto - Objeto del producto a agregar.
 */
function agregarAlCarrito(producto) {
  const existente = carrito.find(function (p) {
    return p.id === producto.id;
  });

  if (existente) {
    // El producto ya está en el carrito → solo aumentar cantidad
    existente.cantidad += 1;
  } else {
    // Producto nuevo → agregar con cantidad 1
    // Usamos spread (...) para copiar el objeto y no mutar el array "productos"
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito(); // CORRECCIÓN: persistir cambio
  actualizarContador();
  renderizarCarrito();
  mostrarToast(producto.nombre + " agregado al carrito ☕");
}

/**
 * Genera las tarjetas HTML de todos los productos
 * y las inserta en el contenedor del menú.
 */
function renderizarProductos() {
  if (!productsContainer) return;

  // Limpiar el contenedor antes de renderizar
  productsContainer.innerHTML = "";

  productos.forEach(function (producto) {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-img-wrap">
        <img
          src="${producto.imagen}"
          alt="${producto.nombre}"
          class="product-img"
          onerror="this.src='https://placehold.co/300x200/4e3629/white?text=☕'"
        />
      </div>
      <div class="product-info">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <span class="product-price">Bs. ${producto.precio}</span>
        <div class="button-group">
          <button class="btn-add"     data-id="${producto.id}">+ Agregar</button>
          <button class="btn-details" data-id="${producto.id}">Ver detalles</button>
        </div>
      </div>
    `;

    productsContainer.appendChild(card);
  });

  // ── Evento: Agregar al carrito desde la tarjeta ──
  // Busca el producto por id y llama a agregarAlCarrito()
  productsContainer.querySelectorAll(".btn-add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      const producto = productos.find(function (p) {
        return p.id === id;
      });
      if (producto) agregarAlCarrito(producto);
    });
  });

  // ── Evento: Ver detalles → abrir modal ──
  // Busca el producto por id y llama a abrirModal()
  productsContainer.querySelectorAll(".btn-details").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = parseInt(this.dataset.id);
      const producto = productos.find(function (p) {
        return p.id === id;
      });
      if (producto) abrirModal(producto);
    });
  });
}

function inicializarFormularioContacto() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("contact-name");
    const email = document.getElementById("contact-email");
    const mensaje = document.getElementById("contact-message");

    const errorNombre = document.getElementById("error-name");
    const errorEmail = document.getElementById("error-email");
    const errrorMensaje = document.getElementById("error-message");

    const exito = document.getElementById("form-succes");

    errorNombre.textContent = "";
    errorEmail.textContent = "";
    errrorMensaje.textContent = "";
    exito.textContent = "";
    let valido = true;

    if (nombre.value.trim() === "") {
      errorNombre.textContent = "El nombre es obligatorio";
      valido = false;
    }

    if (email.value.trim() === "") {
      errorEmail.textContent = "El correo es obligatorio";
      valido = false;
    }

    if (mensaje.value.trim() === "") {
      errrorMensaje.textContent = "El mensaje es obligatorio";
      valido = false;
    }

    if (valido) {
      exito.textContent = "Mensaje enviado con exito";
      form.reset();
    }
  });
}

inicializarFormularioContacto();

// ══════════════════════════════════════════════
// 11. INICIALIZACIÓN
//
//     Orden importante:
//       1. cargarCarrito()      → recuperar datos guardados
//       2. renderizarProductos() → mostrar el menú
//       3. renderizarCarrito()   → mostrar el carrito (puede estar precargado)
//       4. actualizarContador()  → mostrar badge con cantidad correcta
// ══════════════════════════════════════════════
cargarCarrito();
renderizarProductos();
renderizarCarrito();
actualizarContador();
