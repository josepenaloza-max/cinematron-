const db = require("../config/database");

// Modelo de pelicula
class Pelicula {
  static async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM pelicula ORDER BY idPelicula DESC",
    );
    return rows;
  }

  // Obtener película por ID
  static async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM pelicula WHERE idPelicula = ?",
      [id],
    );
    return rows[0];
  }

  // Crear una nueva película
  static async create(data) {
    const { titulo, autor, anio, genero, duracion } = data;
    const [result] = await db.query(
      "INSERT INTO pelicula (titulo, autor, anio, genero, duracion) VALUES (?, ?, ?, ?, ?)",
      [titulo, autor, anio, genero, duracion],
    );
    return result.insertId;
  }

  // Actualizar una película
  static async delete(id) {
    const [result] = await db.query(
      "DELETE FROM pelicula WHERE idPelicula = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = Pelicula;
