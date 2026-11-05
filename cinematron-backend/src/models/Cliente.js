const db = require("../config/database");

//  Modelo de cliente
class Cliente {
  static async findByCedula(cedula) {
    const [rows] = await db.query("SELECT * FROM cliente WHERE cedula = ?", [
      cedula,
    ]);
    return rows[0];
  }

//  Crear un nuevo cliente
  static async create(data) {
    const { nombre, apellido, cedula, email, telefono } = data;
    const [result] = await db.query(
      "INSERT INTO cliente (nombre, apellido, cedula, email, telefono) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellido, cedula, email, telefono],
    );
    return result.insertId;
  }

  // Buscar un cliente por cédula o crear uno nuevo 
  static async findOrCreate(data) {
    let cliente = await this.findByCedula(data.cedula);
    if (!cliente) {
      const id = await this.create(data);
      cliente = { idCliente: id, ...data };
    }
    return cliente;
  }
}

module.exports = Cliente;
