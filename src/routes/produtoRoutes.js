const express = require("express");
const router = express.Router();
const ProdutoController = require("../controllers/ProdutoController");
const auth = require("../middlewares/auth");
const autorizar = require("../middlewares/autorizar");

router.get("/", ProdutoController.listar);
router.get("/:id", ProdutoController.buscarPorId);
router.post("/", auth, autorizar("admin"), ProdutoController.cadastrar);
router.put("/:id", auth, autorizar("admin"), ProdutoController.atualizar);
router.delete("/:id", auth, autorizar("admin"), ProdutoController.deletar);

module.exports = router;
