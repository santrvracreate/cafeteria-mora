// index.js — Punto de entrada del servidor de Cafeteria Aroma
// Guia #7: dotenv debe cargarse en la PRIMERA linea, antes de cualquier require
// que use process.env.
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const productosRouter = require('./routes/productos');
const pedidosRouter = require('./routes/pedidos');

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Debe ir ANTES de express.json() y de las rutas.
// En desarrollo: CORS_ORIGIN=http://localhost:5500
// En produccion: CORS_ORIGIN=https://mi-frontend.netlify.app (o la URL real)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── MIDDLEWARE GLOBAL ─────────────────────────────────────────────────────────
// Parsear body JSON — SIN esto req.body siempre es undefined en POST/PUT
app.use(express.json());

// Logging de peticiones — solo en desarrollo (evitar ruido en produccion)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const hora = new Date().toISOString().substring(11, 19);
    console.log(`[${hora}] ${req.method} ${req.url}`);
    next();
  });
}

// ── RUTA RAIZ ─────────────────────────────────────────────────────────────────
// Health check: permite verificar que el servidor esta activo
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Cafeteria Aroma',
    version: '1.0.0',
    entorno: process.env.NODE_ENV || 'development',
    rutas: ['/api/products', '/api/orders'],
  });
});

// ── RUTA DE ESTADO ────────────────────────────────────────────────────────────
// Util para monitoreo: devuelve uptime y timestamp del servidor
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV || 'development',
  });
});

// ── ROUTERS ───────────────────────────────────────────────────────────────────
app.use('/api/products', productosRouter);
app.use('/api/orders', pedidosRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
// Se ejecuta si ninguna ruta anterior coincidio
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: `Ruta ${req.method} ${req.url} no encontrada`,
  });
});

// ── MANEJADOR DE ERRORES ──────────────────────────────────────────────────────
// Debe tener exactamente 4 parametros para que Express lo reconozca como
// manejador de errores (err, req, res, next).
// Se activa con next(error) desde cualquier middleware o ruta.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
  });
});

// ── INICIAR SERVIDOR ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ☕  Cafeteria Aroma — Backend');
  console.log(`  🚀  Servidor corriendo en http://localhost:${PORT}`);
  console.log(`  🌍  Entorno:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🔒  CORS origin:  ${process.env.CORS_ORIGIN || '*'}`);
  console.log('');
  console.log('  Endpoints disponibles:');
  console.log('  ─────────────────────────────────────');
  console.log('  GET    /');
  console.log('  GET    /api/status');
  console.log('  GET    /api/products');
  console.log('  GET    /api/products/all');
  console.log('  GET    /api/products/search?q=texto');
  console.log('  GET    /api/products/:id');
  console.log('  POST   /api/products');
  console.log('  PUT    /api/products/:id');
  console.log('  DELETE /api/products/:id');
  console.log('  GET    /api/orders');
  console.log('  GET    /api/orders/stats');
  console.log('  GET    /api/orders/:id');
  console.log('  GET    /api/orders/:id/summary');
  console.log('  POST   /api/orders');
  console.log('  PUT    /api/orders/:id/status');
  console.log('  ─────────────────────────────────────');
  console.log('');
});
