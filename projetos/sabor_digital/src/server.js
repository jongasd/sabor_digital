require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!process.env.JWT_SECRET) {
    console.error("Defina JWT_SECRET no arquivo .env (veja .env.example).");
    process.exit(1);
  }

  try {
    const connection = await pool.getConnection();
    console.log("Conexão com MySQL estabelecida! ✔️");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} 🚀`);
    });
  } catch (err) {
    console.error("Erro fatal ao conectar ao banco de dados:", err.message);
    process.exit(1);
  }
}

startServer();
