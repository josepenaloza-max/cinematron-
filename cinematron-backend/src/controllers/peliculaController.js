const Pelicula = require("../models/Pelicula");
const responseHandler = require("../utils/responseHandler");

// Obtener todas las películas
exports.obtenerTodas = async (req, res) => {
  try {
    const peliculas = await Pelicula.findAll();
    responseHandler.success(res, peliculas, "Películas obtenidas");
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener películas");
  }
};

// Obtener una película por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const pelicula = await Pelicula.findById(req.params.id);
    if (!pelicula)
      return responseHandler.notFound(res, "Película no encontrada");
    responseHandler.success(res, pelicula);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener la película");
  }
};

// Crear una película 
exports.crear = async (req, res) => {
  try {
    const { titulo } = req.body;
    if (!titulo) {
      return responseHandler.badRequest(res, "El título es obligatorio");
    }
    const id = await Pelicula.create(req.body);
    responseHandler.created(res, { id }, "Película creada exitosamente");
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al crear la película");
  }
};

// Eliminar una película 
exports.eliminar = async (req, res) => {
  try {
    const eliminada = await Pelicula.delete(req.params.id);
    if (!eliminada)
      return responseHandler.notFound(res, "Película no encontrada");
    responseHandler.success(res, null, "Película eliminada");
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al eliminar la película");
  }
};
