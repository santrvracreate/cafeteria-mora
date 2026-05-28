// routes/productos.js
// Router de Express para los endpoints de productos.
// Responsabilidad: manejar HTTP (req/res, status codes).
// Delega toda la logica de negocio a modules/productos.js.

const express = require('express');
const router = express.Router();

const productos = require('../modules/productos');
const validar = require('../middleware/validar');
const schemas = require('../schemas/productos');

// ── GET / ─────────────────────────────────────────────────────────────────────
// Ruta completa: GET /api/products
// Acepta ?disponible=true|false para filtrar (ejercicio 4, Guia 5)
router.get('/', (req, res) => {
  const { disponible } = req.query;

  if (disponible === 'false') {
    // Devolver solo los NO disponibles (utiles para panel admin)
    const todos = productos.listarTodos();
    const noDisponibles = {
      ...todos,
      datos: todos.datos.filter((p) => !p.disponible),
      mensaje: `${todos.datos.filter((p) => !p.disponible).length} productos no disponibles`,
    };
    return res.json(noDisponibles);
  }

  if (disponible === 'true') {
    return res.json(productos.listarDisponibles());
  }

  // Sin parametro: comportamiento por defecto → solo disponibles
  res.json(productos.listarDisponibles());
});

// ── GET /all ─────────────────────────────────────────────────────────────────
// Ruta completa: GET /api/products/all  (panel de administracion)
// IMPORTANTE: debe ir ANTES de /:id para que Express no la trate como parametro
router.get('/all', (req, res) => {
  res.json(productos.listarTodos());
});

// ── GET /search ───────────────────────────────────────────────────────────────
// Ruta completa: GET /api/products/search?q=texto
// Filtra por nombre sin distinguir mayusculas/minusculas (ejercicio 3, Guia 5)
// IMPORTANTE: debe ir ANTES de /:id
router.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();

  if (!q) {
    return res.status(400).json({
      ok: false,
      error: 'El parametro de busqueda "q" es obligatorio',
    });
  }

  const todos = productos.listarTodos();
  const resultados = todos.datos.filter((p) =>
    p.nombre.toLowerCase().includes(q)
  );

  res.json({
    ok: true,
    mensaje: `${resultados.length} producto(s) encontrado(s) para "${q}"`,
    datos: resultados,
  });
});

// ── GET /:id ─────────────────────────────────────────────────────────────────
// Ruta completa: GET /api/products/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      error: 'El id debe ser un numero positivo',
    });
  }

  const resultado = productos.buscarPorId(id);
  if (!resultado.ok) {
    return res.status(resultado.codigo).json(resultado);
  }
  res.json(resultado);
});

// ── POST / ────────────────────────────────────────────────────────────────────
// Ruta completa: POST /api/products
// El middleware validar() aplica el schema de Joi ANTES del handler.
// Si la validacion falla responde 422 automaticamente.
// Si pasa, req.body ya esta limpio y con defaults aplicados.
router.post('/',
  validar(schemas.crearProducto),
  (req, res) => {
    const resultado = productos.crearProducto(req.body);
    if (!resultado.ok) {
      return res.status(resultado.codigo || 400).json(resultado);
    }
    res.status(201).json(resultado);
  }
);

// ── PUT /:id ──────────────────────────────────────────────────────────────────
// Ruta completa: PUT /api/products/:id
router.put('/:id',
  validar(schemas.actualizarProducto),
  (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'Id invalido' });
    }

    const resultado = productos.actualizarProducto(id, req.body);
    if (!resultado.ok) {
      return res.status(resultado.codigo).json(resultado);
    }
    res.json(resultado);
  }
);

// ── DELETE /:id ───────────────────────────────────────────────────────────────
// Ruta completa: DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ ok: false, error: 'Id invalido' });
  }

  const resultado = productos.eliminarProducto(id);
  if (!resultado.ok) {
    return res.status(resultado.codigo).json(resultado);
  }
  res.json(resultado);
});

module.exports = router;
