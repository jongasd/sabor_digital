const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/UsuarioController");
const {
  authMiddleware,
  authAdminMiddleware,
} = require("../middlewares/authMiddleware");
router.post("/registrar", UsuarioController.registrar);
router.post("/login",  UsuarioController.login);
router.get("/",authMiddleware, authAdminMiddleware,  UsuarioController.listar);
router.delete("/:id",authMiddleware , authAdminMiddleware, UsuarioController.deletar);
module.exports = router;
