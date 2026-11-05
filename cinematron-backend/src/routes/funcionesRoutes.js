const express = require("express");
const router = express.Router();
const funcionController = require("../controllers/funcionController");
const { verificarToken } = require("../controllers/authController");

// Rutas públicas
router.get("/", funcionController.obtenerTodas);
router.get("/pelicula/:peliculaId", funcionController.obtenerPorPelicula);
router.get("/:id", funcionController.obtenerPorId);

// Rutas protegidas 
router.post("/", verificarToken, funcionController.crear);
router.delete("/:id", verificarToken, funcionController.eliminar);

module.exports = router;
