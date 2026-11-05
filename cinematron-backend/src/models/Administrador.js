const db = require("../config/database");

// Modelo de administrador
class Administrador {
  static async findByUsuario(usuario) {
    const [rows] = await db.query(
      "SELECT * FROM administrador WHERE usuario = ?",
      [usuario],
    );
    return rows[0];
  }
}

module.exports = Administrador;
