const jwt = require("jsonwebtoken");
const AppError = require("./appError");

// Exige "Authorization: Bearer <token>" e preenche req.usuarioId / req.usuarioPapel
module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError("Token de autenticação não fornecido", 401));
  }

  const [tipo, token] = authHeader.split(" ");
  if (tipo !== "Bearer" || !token) {
    return next(new AppError("Token inválido (formato esperado: Bearer <token>)", 401));
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.usuarioId = dados.id;
    req.usuarioPapel = dados.papel;
    return next();
  } catch (err) {
    return next(new AppError("Token inválido ou expirado", 401));
  }
};
