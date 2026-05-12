// modules/productos.js
// Manejo de productos del menu de Aroma
const fs = require("fs");
const path = require("path");
const {
  respuestaOk,
  respuestaError,
  validarRequerido,
} = require("./utilidades");
// Cargar productos desde el archivo JSON
const archivoProductos = path.join(__dirname, "../data/productos.json");
function cargarProductos() {
  const contenido = fs.readFileSync(archivoProductos, "utf8");
  return JSON.parse(contenido);
}
function guardarProductos(productos) {
  fs.writeFileSync(archivoProductos, JSON.stringify(productos, null, 2));
}
// GET todos los disponibles
function listarDisponibles() {
  const todos = cargarProductos();
  const disponibles = todos.filter((p) => p.disponible);
  return respuestaOk(
    disponibles,
    `${disponibles.length} productos
disponibles`,
  );
}
// GET todos (incluyendo no disponibles, para el admin)
function listarTodos() {
  const todos = cargarProductos();
  return respuestaOk(todos, `${todos.length} productos en total`);
}
// GET uno por id
function buscarPorId(id) {
  const todos = cargarProductos();
  const producto = todos.find((p) => p.id === parseInt(id));
  if (!producto) return respuestaError("Producto no encontrado", 404);
  return respuestaOk(producto);
}

// POST crear producto
function crearProducto(datos) {
  const errorNombre = validarRequerido(datos.nombre, "nombre");
  if (errorNombre) return respuestaError(errorNombre, 400);
  if (!datos.precio || datos.precio <= 0)
    return respuestaError("El precio debe ser mayor a 0", 400);
  const todos = cargarProductos();
  const maxId = todos.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const nuevo = {
    id: maxId + 1,
    nombre: datos.nombre,
    precio: parseFloat(datos.precio),
    disponible: datos.disponible !== false,
    emoji: datos.emoji || "coffee",
  };
  todos.push(nuevo);
  guardarProductos(todos);
  return respuestaOk(nuevo, "Producto creado correctamente");
}
// PUT actualizar producto
function actualizarProducto(id, datos) {
  const todos = cargarProductos();
  const indice = todos.findIndex((p) => p.id === parseInt(id));
  if (indice === -1) return respuestaError("Producto no encontrado", 404);
  todos[indice] = { ...todos[indice], ...datos };
  guardarProductos(todos);
  return respuestaOk(todos[indice], "Producto actualizado");
}
// DELETE eliminar producto
function eliminarProducto(id) {
  const todos = cargarProductos();
  const producto = todos.find((p) => p.id === parseInt(id));
  if (!producto) return respuestaError("Producto no encontrado", 404);
  const nuevos = todos.filter((p) => p.id !== parseInt(id));

  guardarProductos(nuevos);
  return respuestaOk(producto, "Producto eliminado");
}
module.exports = {
  listarDisponibles,
  listarTodos,
  buscarPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
