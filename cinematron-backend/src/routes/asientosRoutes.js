const express = require("express");
const router = express.Router();
const asientoController = require("../controllers/asientoController");

// Rutas públicas
router.get("/sala/:salaId", asientoController.obtenerPorSala);
router.get(
  "/funcion/:funcionId/disponibles",
  asientoController.obtenerDisponibles,
);

// Obtener todos los asientos ocupados 
router.get("/funcion/:funcionId/ocupados", asientoController.obtenerOcupados);

module.exports = router;
