const express = require("express");
const cors = require("cors");
const path = require("path");

// [1] e [2] Importações do Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const app = express();
const routes = require("./routes");

app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Rota normal da API
app.use("/", routes);

// [3] Criando a rota mágica da Documentação
// Sempre que alguém acessar localhost:3000/api-docs, o swagger vai desenhar a tela baseada no seu JSON
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

module.exports = app;
