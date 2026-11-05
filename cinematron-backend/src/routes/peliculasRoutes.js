const express = require("express");
const router = express.Router();
const peliculaController = require("../controllers/peliculaController");
const { verificarToken } = require("../controllers/authController");

// Rutas públicas
router.get("/", peliculaController.obtenerTodas);
router.get("/:id", peliculaController.obtenerPorId);

// Rutas protegidas 
router.post("/", verificarToken, peliculaController.crear);
router.delete("/:id", verificarToken, peliculaController.eliminar);

module.exports = router;
