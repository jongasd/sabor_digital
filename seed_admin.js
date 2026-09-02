/**
 * Cria (ou atualiza) o primeiro usuário admin direto no banco, sem passar
 * pela API. Rode isso UMA VEZ, localmente, para conseguir o primeiro token
 * de admin. Depois disso, use POST /auth/registrar-admin (com esse token)
 * para criar outros admins pela API normalmente.
 *
 * Uso:
 *   node seed_admin.js "Seu Nome" "seuemail@exemplo.com" "suaSenhaForte123"
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./sabor_digital_corrigido/sabor_digital/src/config/database");

async function main() {
  const [nome, email, senha] = process.argv.slice(2);

  if (!nome || !email || !senha) {
    console.error('Uso: node seed_admin.js "Nome" "email@exemplo.com" "senha"');
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const [existente] = await pool.query(
    "SELECT id FROM usuario WHERE email = ?",
    [email],
  );

  if (existente.length > 0) {
    await pool.query(
      "UPDATE usuario SET nome = ?, senha = ?, papel = 'admin' WHERE email = ?",
      [nome, senhaHash, email],
    );
    console.log(`Usuário existente "${email}" atualizado para admin.`);
  } else {
    await pool.query(
      "INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, 'admin')",
      [nome, email, senhaHash],
    );
    console.log(`Admin "${email}" criado com sucesso.`);
  }

  console.log("Agora faça login normalmente em POST /auth/login com esse email/senha.");
  await pool.end();
}

main().catch((erro) => {
  console.error("Erro ao criar admin:", erro.message);
  process.exit(1);
});
