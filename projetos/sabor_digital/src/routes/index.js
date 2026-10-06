const express = require("express");
const router = express.Router();

const produtoRoutes = require("./produtoRoutes");
const cardapioRoutes = require("./cardapioRoutes");
const pedidoRoutes = require("./pedidoRoutes");
const authRoutes = require("./authRoutes");

router.get("/", (req, res) => {
  res.json({
    mensagem: "API SaborDigital funcionando 🍝",
    versao: "1.0.0",
  });
});

router.use("/auth", authRoutes);
router.use("/produtos", produtoRoutes);
router.use("/cardapios", cardapioRoutes);
router.use("/pedidos", pedidoRoutes);

module.exports = router;
