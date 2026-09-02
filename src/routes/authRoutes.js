const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");
const auth = require("../middlewares/auth");
const autorizar = require("../middlewares/autorizar");

// Login é público: é o único jeito de conseguir um token.
router.post("/login", UsuarioController.login);

// Cadastro público — SEMPRE cria "cliente", mesmo que o front mande outra
// coisa. Nenhum token exigido aqui, de propósito: é o formulário que
// qualquer visitante do site usa pra criar conta.
router.post("/registrar", UsuarioController.register);

// Cadastro de admin — exige token de um admin já existente. Use isso pra
// promover/criar novos admins depois que o primeiro já existir no banco.
router.post(
  "/registrar-admin",
  auth,
  autorizar("admin"),
  UsuarioController.registerAdmin,
);

module.exports = router;
