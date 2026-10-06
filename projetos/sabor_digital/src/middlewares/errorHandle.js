// Último middleware: transforma qualquer erro em uma resposta JSON padronizada.
// Aceita AppError, objetos { status, mensagem } e erros comuns do MySQL/multer.
module.exports = function errorHandler(erro, req, res, next) {
  if (res.headersSent) return next(erro);

  let status = erro.status || erro.statusCode || 500;
  let mensagem = erro.mensagem || erro.message || "Erro interno do servidor";

  if (erro.name === "MulterError") {
    status = 400;
    mensagem = erro.code === "LIMIT_FILE_SIZE" ? "Imagem muito grande (máximo 5MB)" : erro.message;
  } else if (erro.code === "ER_DUP_ENTRY") {
    status = 409;
    mensagem = "Já existe um registro com esses dados";
  } else if (erro.code === "ER_ROW_IS_REFERENCED_2") {
    status = 409;
    mensagem = "Não é possível remover: este registro está em uso (ex.: produto que já foi pedido)";
  } else if (erro.type === "entity.parse.failed") {
    status = 400;
    mensagem = "JSON inválido no corpo da requisição";
  }

  const producao = process.env.NODE_ENV === "production";

  if (status >= 500) {
    console.error(erro);
    if (producao) mensagem = "Erro interno do servidor";
  }

  const resposta = { sucesso: false, mensagem };
  if (!producao && status >= 500) resposta.erro = erro.stack || String(erro);

  res.status(status).json(resposta);
};
