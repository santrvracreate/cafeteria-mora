// modules/productos.js
// Logica de negocio para el manejo de productos del menu de Aroma.
// Esta capa es independiente de Express: recibe datos simples y devuelve objetos.

const fs = require('fs');
const path = require('path');
const { respuestaOk, respuestaError, validarRequerido } = require('./utilidades');

const archivoProductos = path.join(__dirname, '../data/productos.json');

// ── PERSISTENCIA ──────────────────────────────────────────────────────────────

function cargarProductos() {
  try {
    const contenido = fs.readFileSync(archivoProductos, 'utf8');
    return JSON.parse(contenido);
  } catch {
    return [];
  }
}

function guardarProductos(productos) {
  fs.writeFileSync(archivoProductos, JSON.stringify(productos, null, 2));
}

// ── OPERACIONES CRUD ──────────────────────────────────────────────────────────

/**
 * Devuelve solo los productos marcados como disponibles.
 */
function listarDisponibles() {
  const todos = cargarProductos();
  const disponibles = todos.filter((p) => p.disponible);
  return respuestaOk(disponibles, `${disponibles.length} productos disponibles`);
}

/**
 * Devuelve todos los productos (incluidos los no disponibles). Uso: panel admin.
 */
function listarTodos() {
  const todos = cargarProductos();
  return respuestaOk(todos, `${todos.length} productos en total`);
}

/**
 * Busca un producto por su id numerico.
 * @param {number|string} id
 */
function buscarPorId(id) {
  const todos = cargarProductos();
  const producto = todos.find((p) => p.id === parseInt(id));
  if (!producto) return respuestaError('Producto no encontrado', 404);
  return respuestaOk(producto);
}

/**
 * Crea un nuevo producto y lo persiste.
 * Las validaciones de formato las maneja el schema de Joi en la capa de rutas;
 * aqui solo validamos la integridad minima del modelo.
 * @param {{ nombre: string, precio: number, emoji?: string, disponible?: boolean, descripcion?: string }} datos
 */
function crearProducto(datos) {
  const errorNombre = validarRequerido(datos.nombre, 'nombre');
  if (errorNombre) return respuestaError(errorNombre, 400);

  if (!datos.precio || datos.precio <= 0) {
    return respuestaError('El precio debe ser mayor a 0', 400);
  }

  const todos = cargarProductos();
  const maxId = todos.reduce((max, p) => (p.id > max ? p.id : max), 0);

  const nuevo = {
    id: maxId + 1,
    nombre: datos.nombre.trim(),
    precio: parseFloat(datos.precio),
    disponible: datos.disponible !== false,
    emoji: datos.emoji || 'coffee',
    descripcion: datos.descripcion || '',
  };

  todos.push(nuevo);
  guardarProductos(todos);
  return respuestaOk(nuevo, 'Producto creado correctamente');
}

/**
 * Actualiza campos de un producto existente (PATCH semantics con metodo PUT).
 * Solo sobreescribe los campos enviados; los demas quedan igual.
 * @param {number|string} id
 * @param {object} datos - Campos a actualizar.
 */
function actualizarProducto(id, datos) {
  const todos = cargarProductos();
  const indice = todos.findIndex((p) => p.id === parseInt(id));
  if (indice === -1) return respuestaError('Producto no encontrado', 404);

  // Sanitizar nombre si viene incluido
  if (datos.nombre) datos.nombre = datos.nombre.trim();

  todos[indice] = { ...todos[indice], ...datos };
  guardarProductos(todos);
  return respuestaOk(todos[indice], 'Producto actualizado');
}

/**
 * Elimina un producto por id.
 * @param {number|string} id
 */
function eliminarProducto(id) {
  const todos = cargarProductos();
  const producto = todos.find((p) => p.id === parseInt(id));
  if (!producto) return respuestaError('Producto no encontrado', 404);

  const nuevos = todos.filter((p) => p.id !== parseInt(id));
  guardarProductos(nuevos);
  return respuestaOk(producto, 'Producto eliminado');
}

module.exports = {
  listarDisponibles,
  listarTodos,
  buscarPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
