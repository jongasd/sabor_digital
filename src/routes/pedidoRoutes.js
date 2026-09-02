const express = require("express");
const router = express.Router();
const PedidoController = require("../controllers/PedidoController");
const auth = require("../middlewares/auth");
const autorizar = require("../middlewares/autorizar");

// Qualquer usuário autenticado (admin ou cliente) pode criar pedido.
router.post("/", auth, PedidoController.create);
router.get("/", auth, autorizar("admin"), PedidoController.getAll);
router.get("/:id", auth, PedidoController.getById);
router.patch(
  "/:id/status",
  auth,
  autorizar("admin"),
  PedidoController.updateStatus,
);
router.delete("/:id", auth, autorizar("admin"), PedidoController.delete);

module.exports = router;
