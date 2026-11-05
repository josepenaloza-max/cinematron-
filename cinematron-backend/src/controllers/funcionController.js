const Funcion = require("../models/Funcion");
const responseHandler = require("../utils/responseHandler");

// Obtener las funciones
exports.obtenerTodas = async (req, res) => {
  try {
    const funciones = await Funcion.findAll();
    responseHandler.success(res, funciones);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener funciones");
  }
};

// Obtener las funciones por película
exports.obtenerPorPelicula = async (req, res) => {
  try {
    const funciones = await Funcion.findByPelicula(req.params.peliculaId);
    responseHandler.success(res, funciones);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener funciones");
  }
};

// Obtener las funciones por sala
exports.obtenerPorId = async (req, res) => {
  try {
    const funcion = await Funcion.findById(req.params.id);
    if (!funcion) return responseHandler.notFound(res, "Función no encontrada");
    responseHandler.success(res, funcion);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener la función");
  }
};

// Crear una nueva función
exports.crear = async (req, res) => {
  try {
    const { idPelicula, idSala, fechaHora } = req.body;
    if (!idPelicula || !idSala || !fechaHora) {
      return responseHandler.badRequest(res, "Faltan datos obligatorios");
    }
    const id = await Funcion.create(req.body);
    responseHandler.created(res, { id }, "Función creada");
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al crear la función");
  }
};

// Actualizar una función existente
exports.eliminar = async (req, res) => {
  try {
    const eliminada = await Funcion.delete(req.params.id);
    if (!eliminada)
      return responseHandler.notFound(res, "Función no encontrada");
    responseHandler.success(res, null, "Función eliminada");
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al eliminar la función");
  }
};
