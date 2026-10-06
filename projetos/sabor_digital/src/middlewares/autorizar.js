const AppError = require("./appError");

// Uso: autorizar("admin")  (sempre depois de auth)
module.exports = (...papeisPermitidos) => (req, res, next) => {
  if (!papeisPermitidos.includes(req.usuarioPapel)) {
    return next(new AppError("Acesso negado. Você não tem permissão para esta ação.", 403));
  }
  return next();
};
