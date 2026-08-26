const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");
const auth = require("../middlewares/auth");
const autorizar = require("../middlewares/autorizar");

router.post("/login", authController.login);

router.post(
  "/registrar",
  auth,
  autorizar("funcionarios", "criar"),
  UsuarioController.register,
);

module.exports = router;
