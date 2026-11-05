const db = require("../config/database");

// Modelo de sala
class Sala {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM sala");
    return rows;
  }

  // Obtener sala por ID
  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM sala WHERE idSala = ?", [id]);
    return rows[0];
  }
}

module.exports = Sala;
