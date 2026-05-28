// modules/pedidos.js
// Logica de negocio para el sistema de pedidos de Aroma.
// Persiste en data/pedidos.json y consulta precios reales desde productos.js.

const fs = require('fs');
const path = require('path');
const { respuestaOk, respuestaError } = require('./utilidades');

// Importacion diferida para evitar dependencia circular en tiempo de carga
// productos.js no importa pedidos.js, por lo que esto es seguro.
const productosModule = require('./productos');

const archivoPedidos = path.join(__dirname, '../data/pedidos.json');

// ── PERSISTENCIA ──────────────────────────────────────────────────────────────

function cargarPedidos() {
  try {
    const contenido = fs.readFileSync(archivoPedidos, 'utf8');
    return JSON.parse(contenido);
  } catch {
    // Si el archivo no existe o esta corrupto, empezar con array vacio
    return [];
  }
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(archivoPedidos, JSON.stringify(pedidos, null, 2));
}

// ── OPERACIONES ───────────────────────────────────────────────────────────────

/**
 * Devuelve todos los pedidos almacenados.
 */
function listarPedidos() {
  const todos = cargarPedidos();
  return respuestaOk(todos, `${todos.length} pedidos`);
}

/**
 * Busca un pedido especifico por su id.
 * @param {number|string} id
 */
function buscarPorId(id) {
  const todos = cargarPedidos();
  const pedido = todos.find((p) => p.id === parseInt(id));
  if (!pedido) return respuestaError('Pedido no encontrado', 404);
  return respuestaOk(pedido);
}

/**
 * Crea un nuevo pedido calculando el total real desde el catalogo de productos.
 * Cada item recibe: product_id, nombre, cantidad, precio_unit y subtotal.
 *
 * @param {{ items: Array<{ product_id: number, cantidad: number }>, nota?: string }} datos
 */
function crearPedido(datos) {
  const todos = cargarPedidos();
  const maxId = todos.reduce((m, p) => (p.id > m ? p.id : m), 0);

  let total = 0;
  const itemsConPrecio = [];

  for (const item of datos.items) {
    // Consultar precio real en el catalogo
    const prod = productosModule.buscarPorId(item.product_id);
    if (!prod.ok) {
      return respuestaError(`Producto id ${item.product_id} no encontrado`, 400);
    }

    const precio_unit = prod.datos.precio;
    const subtotal = parseFloat((precio_unit * item.cantidad).toFixed(2));
    total += subtotal;

    itemsConPrecio.push({
      product_id: item.product_id,
      nombre: prod.datos.nombre,
      cantidad: item.cantidad,
      precio_unit,
      subtotal,
    });
  }

  const pedido = {
    id: maxId + 1,
    items: itemsConPrecio,
    total: parseFloat(total.toFixed(2)),
    estado: 'pending',
    nota: datos.nota || '',
    creadoEn: new Date().toISOString(),
  };

  todos.push(pedido);
  guardarPedidos(todos);
  return respuestaOk(pedido, `Pedido creado con total Bs. ${pedido.total}`);
}

/**
 * Cambia el estado de un pedido existente.
 * @param {number|string} id
 * @param {string} nuevoEstado - Uno de: pending, preparing, ready, delivered
 */
function actualizarEstado(id, nuevoEstado) {
  const todos = cargarPedidos();
  const idx = todos.findIndex((p) => p.id === parseInt(id));
  if (idx === -1) return respuestaError('Pedido no encontrado', 404);

  todos[idx].estado = nuevoEstado;
  todos[idx].actualizadoEn = new Date().toISOString();
  guardarPedidos(todos);
  return respuestaOk(todos[idx], `Estado actualizado a ${nuevoEstado}`);
}

module.exports = { listarPedidos, buscarPorId, crearPedido, actualizarEstado };
