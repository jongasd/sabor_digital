const express = require("express");
const cors = require("cors");
const app = express();
const routes = require("./routes");

// Middlewares globais
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json());

// Se a requisição não vier com Content-Type: application/json (ou vier
// sem corpo), express.json() não roda e req.body fica undefined — e os
// controllers fazem `const {x} = req.body` sem checar isso antes. Essa
// linha garante que req.body nunca seja undefined, então o pior que
// acontece é um erro 400 de "campo obrigatório" em vez de um TypeError
// cru indo pro errorHandle como erro 500.
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.use("/", routes);

module.exports = app;
