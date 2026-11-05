const responseHandler = {
  success: (res, data, message = "Operación exitosa") => {
    res.status(200).json({ success: true, message, data });
  },
  created: (res, data, message = "Recurso creado") => {
    res.status(201).json({ success: true, message, data });
  },
  error: (res, message = "Error interno", status = 500) => {
    res.status(status).json({ success: false, message });
  },
  notFound: (res, message = "Recurso no encontrado") => {
    res.status(404).json({ success: false, message });
  },
  badRequest: (res, message = "Datos inválidos") => {
    res.status(400).json({ success: false, message });
  },
};

module.exports = responseHandler;
