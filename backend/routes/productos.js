// modules/pedidos.js
const {
  respuestaOk,
  respuestaError,
  validarRequerido,
} = require("./utilidades");
// Base de datos en memoria (por ahora)
let pedidos = [];
let nextId = 1;
function listarPedidos() {
  return respuestaOk(pedidos, `${pedidos.length} pedidos`);
}
function crearPedido(datos) {
  const errorItems = validarRequerido(datos.items, "items");
  if (errorItems) return respuestaError(errorItems, 400);
  if (!Array.isArray(datos.items) || datos.items.length === 0)
    return respuestaError("El pedido debe tener al menos un item", 400);
  const total = datos.items.reduce((acc, item) => {
    return acc + item.precio * item.cantidad;
  }, 0);
  const pedido = {
    id: nextId++,
    items: datos.items,
    total: parseFloat(total.toFixed(2)),
    estado: "pending",
    creadoEn: new Date().toISOString(),
  };
  pedidos.push(pedido);
  return respuestaOk(pedido, "Pedido creado");
}
function actualizarEstado(id, nuevoEstado) {
  const estados = ["pending", "preparing", "ready", "delivered"];
  if (!estados.includes(nuevoEstado))
    return respuestaError("Estado invalido", 400);
  const pedido = pedidos.find((p) => p.id === parseInt(id));
  if (!pedido) return respuestaError("Pedido no encontrado", 404);
  pedido.estado = nuevoEstado;
  return respuestaOk(pedido, "Estado actualizado");
}
module.exports = { listarPedidos, crearPedido, actualizarEstado };
