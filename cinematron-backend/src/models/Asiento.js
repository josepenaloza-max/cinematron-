const db = require("../config/database");

// Modelo de asiento
class Asiento {
  static async findBySala(salaId) {
    const [rows] = await db.query(
      "SELECT * FROM asiento WHERE idSala = ? ORDER BY fila, columna",
      [salaId],
    );
    return rows;
  }

  // Obtener asientos disponibles 
  static async findDisponiblesByFuncion(funcionId) {
    const [rows] = await db.query(
      `SELECT a.* FROM asiento a
            JOIN funcion f ON f.idSala = a.idSala
            WHERE f.idFuncion = ?
            AND a.idAsiento NOT IN (
            SELECT ra.idAsiento FROM reserva_asiento ra
            WHERE ra.idFuncion = ?
            )
            ORDER BY a.fila, a.columna`,
      [funcionId, funcionId],
    );
    return rows;
  }

  // Obtener asientos ocupados
  static async findOcupadosByFuncion(funcionId) {
    const [rows] = await db.query(
      `SELECT a.* FROM asiento a
            JOIN reserva_asiento ra ON ra.idAsiento = a.idAsiento
            WHERE ra.idFuncion = ?`,
      [funcionId],
    );
    return rows;
  }
}

module.exports = Asiento;
