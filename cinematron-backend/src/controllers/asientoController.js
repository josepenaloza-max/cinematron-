
const Asiento = require("../models/Asiento");
const responseHandler = require("../utils/responseHandler");

// Obtener todos la lista de los asientos
exports.obtenerPorSala = async (req, res) => {
  try {
    const asientos = await Asiento.findBySala(req.params.salaId);
    responseHandler.success(res, asientos);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener asientos");
  }
};

// Obtener todos los asientos disponibles para una función 
exports.obtenerDisponibles = async (req, res) => {
  try {
    const asientos = await Asiento.findDisponiblesByFuncion(
      req.params.funcionId,
    );
    responseHandler.success(res, asientos);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener asientos disponibles");
  }
};

// Obtener todos los asientos ocupados para una función
exports.obtenerOcupados = async (req, res) => {
  try {
    const asientos = await Asiento.findOcupadosByFuncion(req.params.funcionId);
    responseHandler.success(res, asientos);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener asientos ocupados");
  }
};
