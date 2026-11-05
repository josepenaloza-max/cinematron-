const Reserva = require("../models/Reserva");
const Cliente = require("../models/Cliente");
const generateCode = require("../utils/generateCode");
const responseHandler = require("../utils/responseHandler");
const db = require("../config/database");

// Crear una nueva reserva
exports.crearReserva = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      nombre,
      apellido,
      cedula,
      email,
      telefono,
      funcionId,
      asientosIds,
    } = req.body;

    // Validaciones
    if (
      !nombre ||
      !cedula ||
      !funcionId ||
      !asientosIds ||
      asientosIds.length === 0
    ) {
      await connection.rollback();
      return responseHandler.badRequest(res, "Faltan datos obligatorios");
    }

    if (asientosIds.length > 4) {
      await connection.rollback();
      return responseHandler.badRequest(res, "Máximo 4 asientos por reserva");
    }

    // Verificar disponibilidad de asientos
    const [ocupados] = await connection.query(
      `SELECT idAsiento FROM reserva_asiento 
      WHERE idFuncion = ? AND idAsiento IN (?)`,
      [funcionId, asientosIds],
    );

    if (ocupados.length > 0) {
      await connection.rollback();
      return responseHandler.badRequest(
        res,
        "Algunos asientos ya están ocupados",
      );
    }

    // Buscar o crear cliente
    let [clientes] = await connection.query(
      "SELECT * FROM cliente WHERE cedula = ?",
      [cedula],
    );

    let idCliente;
    if (clientes.length > 0) {
      idCliente = clientes[0].idCliente;
    } else {
      const apellidoFinal = apellido || "";
      const emailFinal = email || "";

      const [result] = await connection.query(
        "INSERT INTO cliente (nombre, apellido, cedula, email, telefono) VALUES (?, ?, ?, ?, ?)",
        [nombre, apellidoFinal, cedula, emailFinal, telefono],
      );
      idCliente = result.insertId;
    }

    //  Generar código alfanumérico de la reserva
    const codigo = generateCode();

    //  Crear reserva
    const [reservaResult] = await connection.query(
      "INSERT INTO reserva (codigo, idCliente) VALUES (?, ?)",
      [codigo, idCliente],
    );
    const idReserva = reservaResult.insertId;

    // Asociar asientos 
    for (const idAsiento of asientosIds) {
      await connection.query(
        "INSERT INTO reserva_asiento (idReserva, idAsiento, idFuncion) VALUES (?, ?, ?)",
        [idReserva, idAsiento, funcionId],
      );
    }

    //  Obtener detalles para el comprobante
    const [detalles] = await connection.query(
      `SELECT 
          r.codigo, r.fechaReserva,
          c.nombre as cliente, c.cedula, c.telefono,
          p.titulo as pelicula, s.nombre as sala, f.fechaHora,
          GROUP_CONCAT(CONCAT(a.fila, a.columna) SEPARATOR ', ') as asientos
          FROM reserva r
          JOIN cliente c ON c.idCliente = r.idCliente
          JOIN reserva_asiento ra ON ra.idReserva = r.idReserva
          JOIN asiento a ON a.idAsiento = ra.idAsiento
          JOIN funcion f ON f.idFuncion = ra.idFuncion
          JOIN pelicula p ON p.idPelicula = f.idPelicula
          JOIN sala s ON s.idSala = f.idSala
          WHERE r.idReserva = ?
          GROUP BY 
          r.idReserva, 
          r.codigo, 
          r.fechaReserva, 
          c.nombre, 
          c.cedula, 
          c.telefono, 
          p.titulo, 
          s.nombre, 
          f.fechaHora`,
      [idReserva],
    );

    await connection.commit();

    responseHandler.created(res, detalles[0], "Reserva creada exitosamente");
  } catch (error) {
    await connection.rollback();
    console.error("Error en crearReserva:", error);
    responseHandler.error(res, "Error al crear la reserva");
  } finally {
    connection.release();
  }
};

// Obtener todas las reservas
exports.obtenerTodas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll();
    responseHandler.success(res, reservas);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener reservas");
  }
};

// Obtener una reserva por código
exports.obtenerPorCodigo = async (req, res) => {
  try {
    const reserva = await Reserva.findByCodigo(req.params.codigo);
    if (!reserva) return responseHandler.notFound(res, "Reserva no encontrada");
    responseHandler.success(res, reserva);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error al obtener la reserva");
  }
};
