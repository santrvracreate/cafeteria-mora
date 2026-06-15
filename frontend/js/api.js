// js/api.js — URL base de la API
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://aroma-backend-mogp.onrender.com";

async function apiGet(ruta) {
  const res = await fetch(API_BASE + ruta);
  return res.json();
}

async function apiPost(ruta, datos) {
  const res = await fetch(API_BASE + ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
}
