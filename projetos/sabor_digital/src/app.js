const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandle");

const app = express();

app.use(cors());
app.use(express.json());

// Express 5 deixa req.body indefinido quando a requisição não tem corpo; garante um objeto
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// Arquivos estáticos (imagens de uploads)
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Documentação da API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Rotas da API
app.use("/", routes);

// 404 para rotas que não existem
app.use((req, res) => {
  res.status(404).json({ sucesso: false, mensagem: "Rota não encontrada" });
});

// Tratamento de erros: sempre o último
app.use(errorHandler);

module.exports = app;
