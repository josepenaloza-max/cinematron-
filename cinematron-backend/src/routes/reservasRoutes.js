const express = require("express");
const router = express.Router();
const reservaController = require("../controllers/reservaController");
const { verificarToken } = require("../controllers/authController");

// Rutas públicas
router.post("/", reservaController.crearReserva);
router.get("/:codigo", reservaController.obtenerPorCodigo);

// Rutas protegidas 
router.get("/", verificarToken, reservaController.obtenerTodas);

module.exports = router;
