// schemas/productos.js
// Schemas de Joi para validar los datos de entrada de los endpoints de productos.
// Se usan en conjunto con el middleware /middleware/validar.js.

const Joi = require('joi');

/**
 * Schema para CREAR un producto (POST /api/products).
 * Todos los campos de negocio estan definidos aqui.
 */
const crearProducto = Joi.object({
  nombre: Joi.string().min(2).max(100).trim().required()
    .messages({
      'string.empty': 'El nombre no puede estar vacio',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede superar los 100 caracteres',
      'any.required': 'El nombre es obligatorio',
    }),

  precio: Joi.number().positive().max(500).required()
    .messages({
      'number.base': 'El precio debe ser un numero',
      'number.positive': 'El precio debe ser mayor a 0',
      'number.max': 'El precio maximo es Bs. 500',
      'any.required': 'El precio es obligatorio',
    }),

  emoji: Joi.string().default('coffee'),

  disponible: Joi.boolean().default(true),

  descripcion: Joi.string().min(5).max(200).optional().allow(''),
});

/**
 * Schema para ACTUALIZAR un producto (PUT /api/products/:id).
 * Todos los campos son opcionales, pero al menos uno debe enviarse (.min(1)).
 */
const actualizarProducto = Joi.object({
  nombre: Joi.string().min(2).max(100).trim()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
    }),

  precio: Joi.number().positive().max(500)
    .messages({
      'number.positive': 'El precio debe ser mayor a 0',
      'number.max': 'El precio maximo es Bs. 500',
    }),

  emoji: Joi.string(),

  disponible: Joi.boolean(),

  descripcion: Joi.string().max(200).allow(''),
}).min(1); // al menos un campo es obligatorio en un PUT

module.exports = { crearProducto, actualizarProducto };
