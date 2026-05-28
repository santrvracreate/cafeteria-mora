// middleware/validar.js
// Middleware de validacion reutilizable.
// Recibe un schema de Joi y devuelve una funcion de middleware Express.
//
// Uso en una ruta:
//   router.post('/', validar(schemas.crearProducto), handlerFn);
//
// Si los datos no pasan la validacion, responde 422 con todos los errores.
// Si pasan, reemplaza req.body con los datos limpios y llama a next().

/**
 * @param {import('joi').Schema} schema - Schema de Joi a aplicar sobre req.body.
 * @returns {import('express').RequestHandler}
 */
function validar(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // reportar TODOS los errores, no solo el primero
      stripUnknown: true,  // descartar campos que no estan en el schema
    });

    if (error) {
      const detalles = error.details.map((d) => d.message);
      return res.status(422).json({
        ok: false,
        error: 'Datos invalidos',
        detalles,
      });
    }

    // Reemplazar req.body con los datos validados, saneados y con defaults aplicados
    req.body = value;
    next();
  };
}

module.exports = validar;
