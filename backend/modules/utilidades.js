// modules/utilidades.js
// Funciones reutilizables del servidor
// Respuesta de exito estandar
function respuestaOk(datos, mensaje) {
  return {
    ok: true,
    mensaje: mensaje || "Operacion exitosa",
    datos: datos,
  };
}
// Respuesta de error estandar
function respuestaError(mensaje, codigo) {
  return {
    ok: false,
    error: mensaje || "Error interno",
    codigo: codigo || 500,
  };
}
// Validar que un campo no este vacio
function validarRequerido(valor, campo) {
  if (valor === undefined || valor === null || valor === "") {
    return `El campo '${campo}' es obligatorio`;
  }
  return null; // null = sin error
}
// Formatear precio a 2 decimales
function formatearPrecio(precio) {
  return parseFloat(precio).toFixed(2);
}
module.exports = {
  respuestaOk,
  respuestaError,
  validarRequerido,
  formatearPrecio,
};
