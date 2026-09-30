const express = require("express");
const router = express.Router();
const CardapioController = require("../controllers/CardapioController");
const auth = require("../middlewares/auth");
const autorizar = require("../middlewares/autorizar");

router.get("/", CardapioController.listar);
router.get("/:id", CardapioController.buscarPorId);
router.post("/", auth, autorizar("admin"), CardapioController.cadastrar);
router.delete("/:id", auth, autorizar("admin"), CardapioController.deletar);

module.exports = router;
