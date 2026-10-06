// Cria (ou promove) o primeiro administrador.
// Uso: npm run criar-admin -- "Seu Nome" seu@email.com SuaSenha
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/database");

async function main() {
  const [nome, email, senha] = process.argv.slice(2);

  if (!nome || !email || !senha) {
    console.error('Uso: npm run criar-admin -- "Nome" email senha');
    process.exit(1);
  }
  if (senha.length < 6) {
    console.error("A senha deve ter pelo menos 6 caracteres.");
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await pool.query(
    `INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE papel = 'admin'`,
    [nome.trim(), email.trim().toLowerCase(), senhaHash],
  );

  console.log(`Administrador pronto: ${email.trim().toLowerCase()}`);
  await pool.end();
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
