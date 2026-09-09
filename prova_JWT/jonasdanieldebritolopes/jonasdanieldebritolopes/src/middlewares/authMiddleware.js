const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Token com formato inválido" });
  }
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token mal formatado" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
    req.usuarioId = decoded.id;
    req.usuarioEmail = decoded.email;
    req.usuarioPapel = decoded.papel;
    console.log(usuarioPapel)
    return next();
  });
}
function authAdminMiddleware(req, res, next) {
  if (req.usuarioPapel !== "admin") {
    return res.status(403).json({
      error: "Acesso negado. Apenas administradores podem executar esta ação.",
    });
  }
  next();
}

module.exports = { authMiddleware, authAdminMiddleware };
