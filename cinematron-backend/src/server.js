require("dotenv").config();
const app = require("./app");

// Puerto de escucha
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log("========================================");
  console.log(` Servidor Cinematrón corriendo`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Ambiente: ${process.env.NODE_ENV}`);
  console.log("========================================");
});
