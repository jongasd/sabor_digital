// Erro com código HTTP, para os services lançarem: throw new AppError("msg", 404)
class AppError extends Error {
  constructor(mensagem, status = 500) {
    super(mensagem);
    this.name = "AppError";
    this.mensagem = mensagem;
    this.status = status;
  }
}

module.exports = AppError;
