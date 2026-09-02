const pool = require("../config/database");

class UsuarioRepository {
  async findAll() {
    const [rows] = await pool.query(
      "SELECT id, nome, email, papel, criado_em FROM usuario ORDER BY id DESC",
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, nome, email, papel, criado_em FROM usuario WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  }

  // Usado no login: aqui SIM precisa vir a senha (hash), para comparar com bcrypt.
  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  }

  async create({ nome, email, senhaHash, papel }) {
    const [result] = await pool.query(
      "INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, ?)",
      [nome, email, senhaHash, papel || "cliente"],
    );
    return this.findById(result.insertId);
  }
}

module.exports = new UsuarioRepository();
