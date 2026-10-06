const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Sabor Digital API",
    description: "Documentação da API Sabor Digital",
    version: "1.0.0",
  },
  host: "localhost:3000",
  schemes: ["http"],
  securityDefinitions: {
    // Swagger 2.0: no botão Authorize digite "Bearer <seu token>"
    bearerAuth: { type: "apiKey", name: "Authorization", in: "header" },
  },
};

// Caminho relativo a onde o comando é executado (raiz do projeto: npm run swagger)
const outputFile = "./src/swagger_output.json";
const endpointsFiles = ["./src/routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Documentação do Swagger gerada com sucesso!");
});
