const AppError = require("./appError");

// Autorização baseada no campo "papel" da tabela usuario (admin | cliente).
// Uso: autorizar("admin") ou autorizar("admin", "cliente")
const autorizar =
  (...papeisPermitidos) =>
  (req, res, next) => {
    const papel = req.usuario?.papel;

    if (!papel || !papeisPermitidos.includes(papel)) {
      return next(
        new AppError("Você não tem permissão para realizar esta ação", 403),
      );
    }

    next();
  };

module.exports = autorizar;
