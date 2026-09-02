const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");
const auth = require("../middlewares/auth");
const autorizar = require("../middlewares/autorizar");

// Login é público: é o único jeito de conseguir um token.
router.post("/login", UsuarioController.login);

// Cadastro exige token válido de um admin (mantém a intenção original
// do código, agora consertada e baseada no papel do usuário).
router.post("/registrar", auth, autorizar("admin"), UsuarioController.register);

module.exports = router;
