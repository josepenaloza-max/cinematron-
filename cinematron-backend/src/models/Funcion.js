const db = require("../config/database");


// Modelo de funcion
class Funcion {
    static async findAll() {
        const [rows] = await db.query(
            `SELECT f.*, p.titulo as pelicula, p.sinopsis as sinopsis, s.nombre as sala, s.tipo as tipo_sala
             FROM funcion f
             JOIN pelicula p ON p.idPelicula = f.idPelicula
             JOIN sala s ON s.idSala = f.idSala
             ORDER BY f.fechaHora`
        );
        return rows;
    }

    static async findByPelicula(peliculaId) {
        const [rows] = await db.query(
            `SELECT f.*, p.sinopsis as sinopsis, s.nombre as sala, s.tipo as tipo_sala
             FROM funcion f
             JOIN pelicula p ON p.idPelicula = f.idPelicula
             JOIN sala s ON s.idSala = f.idSala
             WHERE f.idPelicula = ?
             ORDER BY f.fechaHora`,
            [peliculaId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            `SELECT f.*, p.titulo as pelicula, p.sinopsis as sinopsis, s.nombre as sala, s.tipo as tipo_sala
             FROM funcion f
             JOIN pelicula p ON p.idPelicula = f.idPelicula
             JOIN sala s ON s.idSala = f.idSala
             WHERE f.idFuncion = ?`,
            [id]
        );
        return rows[0];
    }
    

  // Crear una nueva función
  static async create(data) {
    const { idPelicula, idSala, fechaHora, precio } = data;
    const [result] = await db.query(
      "INSERT INTO funcion (idPelicula, idSala, fechaHora, precio) VALUES (?, ?, ?, ?)",
      [idPelicula, idSala, fechaHora, precio],
    );
    return result.insertId;
  }

  // Eliminar una función
  static async delete(id) {
    const [result] = await db.query("DELETE FROM funcion WHERE idFuncion = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = Funcion;
