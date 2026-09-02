const AppError = require("./appError");

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
