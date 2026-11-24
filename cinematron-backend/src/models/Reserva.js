const db = require("../config/database");

// Modelo de reserva
class Reserva {
  static async create(data) {
    const { codigo, idCliente } = data;
    const [result] = await db.query(
      "INSERT INTO reserva (codigo, idCliente) VALUES (?, ?)",
      [codigo, idCliente],
    );
    return result.insertId;
  }

  // Agregar asientos a una reserva
  static async addAsientos(idReserva, asientosIds, funcionId) {
    const values = asientosIds.map((idAsiento) => [
      idReserva,
      idAsiento,
      funcionId,
    ]);
    await db.query(
      "INSERT INTO reserva_asiento (idReserva, idAsiento, idFuncion) VALUES ?",
      [values],
    );
  }

  // Obtener reserva por código
  static async findByCodigo(codigo) {
    const [rows] = await db.query(
      `SELECT r.*, c.nombre as cliente, c.cedula, c.email, c.telefono
            FROM reserva r
            JOIN cliente c ON c.idCliente = r.idCliente
            WHERE r.codigo = ?`,
      [codigo],
    );
    return rows[0];
  }

  // Obtener todas las reservas
 static async findAll() {
    const [rows] = await db.query(
      `SELECT 
          r.idReserva,
          r.codigo, 
          r.fechaReserva,
          c.nombre as cliente, 
          c.telefono,
          IFNULL(p.titulo, 'Sin película') as pelicula,
          IFNULL(GROUP_CONCAT(CONCAT(a.fila, a.columna) SEPARATOR ', '), 'Sin asientos') as asientos
        FROM reserva r
        JOIN cliente c ON c.idCliente = r.idCliente
        LEFT JOIN reserva_asiento ra ON ra.idReserva = r.idReserva
        LEFT JOIN asiento a ON a.idAsiento = ra.idAsiento
        LEFT JOIN funcion f ON f.idFuncion = ra.idFuncion
        LEFT JOIN pelicula p ON p.idPelicula = f.idPelicula
        GROUP BY 
          r.idReserva, 
          r.codigo, 
          r.fechaReserva, 
          c.nombre, 
          c.telefono, 
          p.titulo
        ORDER BY r.fechaReserva DESC`
    );
    return rows;
  }

  // Obtener detalles completos de una reserva
  static async getDetalleCompleto(idReserva) {
    const [reserva] = await db.query(
      `SELECT r.*, c.nombre as cliente, c.cedula, c.email, c.telefono
            FROM reserva r
            JOIN cliente c ON c.idCliente = r.idCliente
            WHERE r.idReserva = ?`,
      [idReserva],
    );

    // Obtener los asientos asociados a la reserva
    const [asientos] = await db.query(
      `SELECT a.fila, a.columna, f.fechaHora, p.titulo as pelicula, s.nombre as sala
            FROM reserva_asiento ra
            JOIN asiento a ON a.idAsiento = ra.idAsiento
            JOIN funcion f ON f.idFuncion = ra.idFuncion
            JOIN pelicula p ON p.idPelicula = f.idPelicula
            JOIN sala s ON s.idSala = f.idSala
            WHERE ra.idReserva = ?`,
      [idReserva],
    );

    return {
      reserva: reserva[0],
      asientos,
    };
  }
}

module.exports = Reserva;
