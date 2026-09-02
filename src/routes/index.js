const express = require("express");
const router = express.Router();

const produtoRoutes = require("./produtoRoutes");
const cardapioRoutes = require("./cardapioRoutes");
const pedidoRoutes = require("./pedidoRoutes");
const authRoutes = require("./authRoutes");
const errorHandler = require("../middlewares/errorHandle");

// Rota base (Root endpoint que estava em app.js)
router.get("/", (req, res) => {
  res.json({
    mensagem: "API SaborDigital funcionando 🍝",
    versao: "1.0.0",
    arquitetura: "MVC + SOLID (Refatorada)",
  });
});

// Registrar domínios de rotas
router.use("/auth", authRoutes);
router.use("/produtos", produtoRoutes);
router.use("/cardapios", cardapioRoutes);
router.use("/pedidos", pedidoRoutes);

// Error handler tem que ser o ÚLTIMO middleware, depois de todas as rotas.
router.use(errorHandler);

module.exports = router;
