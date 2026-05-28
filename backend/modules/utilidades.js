// modules/utilidades.js
// Funciones auxiliares compartidas por todos los modulos del backend de Aroma

/**
 * Construye un objeto de respuesta exitosa estandarizado.
 * @param {*} datos - El payload principal a devolver al cliente.
 * @param {string} [mensaje] - Mensaje descriptivo opcional.
 * @returns {{ ok: true, mensaje?: string, datos: * }}
 */
function respuestaOk(datos, mensaje) {
  const respuesta = { ok: true };
  if (mensaje) respuesta.mensaje = mensaje;
  respuesta.datos = datos;
  return respuesta;
}

/**
 * Construye un objeto de respuesta de error estandarizado.
 * @param {string} error - Descripcion del error.
 * @param {number} [codigo=400] - Codigo de estado HTTP asociado.
 * @returns {{ ok: false, error: string, codigo: number }}
 */
function respuestaError(error, codigo = 400) {
  return { ok: false, error, codigo };
}

/**
 * Valida que un campo requerido no sea nulo, undefined ni cadena vacia.
 * @param {*} valor - El valor a validar.
 * @param {string} campo - Nombre del campo (para el mensaje de error).
 * @returns {string|null} Mensaje de error si falla, null si es valido.
 */
function validarRequerido(valor, campo) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return `El campo ${campo} es obligatorio`;
  }
  return null;
}

module.exports = { respuestaOk, respuestaError, validarRequerido };
