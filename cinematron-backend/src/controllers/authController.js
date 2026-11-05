const jwt = require("jsonwebtoken");
const responseHandler = require("../utils/responseHandler");

//   autenticación
exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return responseHandler.badRequest(
        res,
        "Usuario y contraseña son obligatorios",
      );
    }

    // verifica las credenciales 
    if (
      usuario === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { usuario, rol: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );
      return responseHandler.success(res, { token, usuario }, "Login exitoso");
    }

    // credenciales incorrectas
    responseHandler.error(res, "Credenciales incorrectas", 401);
  } catch (error) {
    console.error(error);
    responseHandler.error(res, "Error en el login");
  }
};

// se verifica el token
exports.verificarToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return responseHandler.error(res, "Token no proporcionado", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    responseHandler.error(res, "Token inválido", 401);
  }
};
