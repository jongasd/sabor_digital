const pool = require("../config/database");

class UsuarioRepository {
  async findAll() {
    const [rows] = await pool.query("SELECT * FROM usuario ORDER BY id DESC");
    return rows;
  }
  async findById(id) {
    const [usuarioRows] = await pool.query(
      "SELECT * FROM usuario WHERE id = ?",
      [id],
    );
    if (usuarioRows.length === 0) return null;

    const usuario = usuarioRows[0];

    return usuario;
  }
  async findByEmail(email) {
    const resultado = await pool.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email],
    );

    if (resultado.length === 0) return null;

    return resultado;
  }
  async create(id, dados) {
    const { nome, email, senha, papel } = dados;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        "INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?)"
        [nome, email, senha, papel || 'cliente'],
      );
      const usuarioId = result.insertId;

      if (id && id.length > 0) {
        const values = id.map((id) => [usuarioId, id]);
        await connection.query("INSERT INTO usuario ()");
      }
    } catch (error) {}
    const resultado = await pool.query("INSERT INTO usuario SET ?", [dados]);
    return resultado;
  }
}

module.exports = new UsuarioRepository();
