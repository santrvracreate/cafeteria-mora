// schemas/pedidos.js
// Schemas de Joi para validar los datos de entrada de los endpoints de pedidos.

const Joi = require('joi');

/**
 * Schema de cada item dentro del array 'items' de un pedido.
 * El cliente solo envia product_id y cantidad.
 * El precio_unit lo calcula el servidor consultando el catalogo.
 */
const itemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'product_id debe ser un numero entero',
      'number.integer': 'product_id debe ser un numero entero',
      'number.positive': 'product_id debe ser mayor a 0',
      'any.required': 'product_id es obligatorio en cada item',
    }),

  cantidad: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'La cantidad debe ser un numero',
      'number.integer': 'La cantidad debe ser un numero entero',
      'number.min': 'La cantidad debe ser al menos 1',
      'any.required': 'La cantidad es obligatoria en cada item',
    }),
});

/**
 * Schema del pedido completo para POST /api/orders.
 */
const crearPedido = Joi.object({
  items: Joi.array().items(itemSchema).min(1).required()
    .messages({
      'array.base': 'Los items deben ser un array',
      'array.min': 'El pedido debe tener al menos un item',
      'any.required': 'Los items son obligatorios',
    }),

  nota: Joi.string().max(200).optional().allow(''),
});

/**
 * Schema para cambiar el estado de un pedido (PUT /api/orders/:id/status).
 */
const actualizarEstado = Joi.object({
  estado: Joi.string()
    .valid('pending', 'preparing', 'ready', 'delivered')
    .required()
    .messages({
      'any.only': 'Estado no valido. Valores permitidos: pending, preparing, ready, delivered',
      'any.required': 'El campo estado es obligatorio',
    }),
});

module.exports = { crearPedido, actualizarEstado };
