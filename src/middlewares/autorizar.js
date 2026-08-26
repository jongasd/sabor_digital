const AppError = require("./appError");

const autorizar = (recurso, acao) => (req, res, next) => {
  const permissoes = req.usuario?.permissoes || [];
  const chave = `${recurso}:${acao}`;

  if (!permissoes.includes(chave)) {
    return next(
      new AppError("Você não tem permissão para realizar esta ação", 403),
    );
  }

  next();
};

module.exports = autorizar;
