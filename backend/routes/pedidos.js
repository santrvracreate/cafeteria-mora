// routes/pedidos.js
// Router de Express para los endpoints de pedidos.
// Responsabilidad: manejar HTTP (req/res, status codes).
// Delega toda la logica de negocio a modules/pedidos.js.

const express = require('express');
const router = express.Router();

const pedidos = require('../modules/pedidos');
const validar = require('../middleware/validar');
const schemas = require('../schemas/pedidos');

// ── GET / ─────────────────────────────────────────────────────────────────────
// Ruta completa: GET /api/orders
router.get('/', (req, res) => {
  res.json(pedidos.listarPedidos());
});

// ── GET /stats ────────────────────────────────────────────────────────────────
// Ruta completa: GET /api/orders/stats
// Devuelve estadisticas generales de todos los pedidos (ejercicio 5, Guia 6).
// IMPORTANTE: debe ir ANTES de /:id
router.get('/stats', (req, res) => {
  const resultado = pedidos.listarPedidos();
  const todos = resultado.datos;

  if (todos.length === 0) {
    return res.json({
      ok: true,
      datos: {
        totalPedidos: 0,
        totalIngresos: 0,
        pedidoMayorTotal: null,
        conteo: { pending: 0, preparing: 0, ready: 0, delivered: 0 },
      },
    });
  }

  const totalIngresos = parseFloat(
    todos.reduce((sum, p) => sum + p.total, 0).toFixed(2)
  );

  const pedidoMayorTotal = todos.reduce(
    (max, p) => (p.total > max.total ? p : max),
    todos[0]
  );

  const conteo = todos.reduce(
    (acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    },
    { pending: 0, preparing: 0, ready: 0, delivered: 0 }
  );

  res.json({
    ok: true,
    datos: {
      totalPedidos: todos.length,
      totalIngresos,
      pedidoMayorTotal: {
        id: pedidoMayorTotal.id,
        total: pedidoMayorTotal.total,
      },
      conteo,
    },
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
// Ruta completa: GET /api/orders/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'Id invalido' });
  }

  const resultado = pedidos.buscarPorId(id);
  if (!resultado.ok) {
    return res.status(resultado.codigo).json(resultado);
  }
  res.json(resultado);
});

// ── GET /:id/summary ──────────────────────────────────────────────────────────
// Ruta completa: GET /api/orders/:id/summary
// Devuelve un resumen legible del pedido (ejercicio 4, Guia 6).
// IMPORTANTE: Express compara rutas en orden; /:id captura antes que /:id/summary
// si se registran en ese orden, por eso esta ruta tiene la URL completa con /summary.
router.get('/:id/summary', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'Id invalido' });
  }

  const resultado = pedidos.buscarPorId(id);
  if (!resultado.ok) {
    return res.status(resultado.codigo).json(resultado);
  }

  const p = resultado.datos;

  // Formatear fecha: 'dd/MM/yyyy HH:mm'
  const fecha = new Date(p.creadoEn);
  const fechaFormateada =
    `${String(fecha.getDate()).padStart(2, '0')}/` +
    `${String(fecha.getMonth() + 1).padStart(2, '0')}/` +
    `${fecha.getFullYear()} ` +
    `${String(fecha.getHours()).padStart(2, '0')}:` +
    `${String(fecha.getMinutes()).padStart(2, '0')}`;

  const resumen = {
    id: p.id,
    estado: p.estado,
    total: p.total,
    cantidadItems: p.items.reduce((s, i) => s + i.cantidad, 0),
    productos: p.items.map((i) => ({
      nombre: i.nombre,
      cantidad: i.cantidad,
      subtotal: i.subtotal,
    })),
    nota: p.nota || '',
    creadoEn: fechaFormateada,
  };

  res.json({ ok: true, datos: resumen });
});

// ── POST / ────────────────────────────────────────────────────────────────────
// Ruta completa: POST /api/orders
router.post('/',
  validar(schemas.crearPedido),
  (req, res) => {
    const resultado = pedidos.crearPedido(req.body);
    if (!resultado.ok) {
      return res.status(resultado.codigo || 400).json(resultado);
    }
    res.status(201).json(resultado);
  }
);

// ── PUT /:id/status ───────────────────────────────────────────────────────────
// Ruta completa: PUT /api/orders/:id/status
router.put('/:id/status',
  validar(schemas.actualizarEstado),
  (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'Id invalido' });
    }

    const resultado = pedidos.actualizarEstado(id, req.body.estado);
    if (!resultado.ok) {
      return res.status(resultado.codigo).json(resultado);
    }
    res.json(resultado);
  }
);

module.exports = router;
