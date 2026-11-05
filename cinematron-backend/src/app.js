const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Configuración de CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const peliculasRoutes = require("./routes/peliculasRoutes");
const funcionesRoutes = require("./routes/funcionesRoutes");
const asientosRoutes = require("./routes/asientosRoutes");
const reservasRoutes = require("./routes/reservasRoutes");
const authRoutes = require("./routes/authRoutes");

// Definir rutas
app.use("/api/peliculas", peliculasRoutes);
app.use("/api/funciones", funcionesRoutes);
app.use("/api/asientos", asientosRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/auth", authRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    mensaje: "🎬 API de Cinematrón funcionando",
    version: "1.0.0",
    endpoints: {
      peliculas: "/api/peliculas",
      funciones: "/api/funciones",
      asientos: "/api/asientos",
      reservas: "/api/reservas",
      auth: "/api/auth/login",
    },
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

module.exports = app;
