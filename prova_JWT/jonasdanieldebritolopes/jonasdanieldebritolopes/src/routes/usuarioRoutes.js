const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");
const {
  authMiddleware,
  authAdminMiddleware,
} = require("../middlewares/authMiddleware");
router.post("/registrar", UsuarioController.registrar);
router.post("/login",authMiddleware,  UsuarioController.login);
router.get("/", authAdminMiddleware, UsuarioController.listar);
router.delete("/:id", authAdminMiddleware, UsuarioController.deletar);
module.exports = router;
