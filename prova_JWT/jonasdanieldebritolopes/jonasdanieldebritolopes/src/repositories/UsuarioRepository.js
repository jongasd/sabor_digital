const db = require('../config/database');
class UsuarioRepository {
    async buscarPorEmail(email) {
        const [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        return rows[0];
    }
    async criar(usuario) {
        const { nome, email, senha } = usuario;
        const [result] = await db.query(
            'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senha]
        );
        return result.insertId;
    }
    async buscarPorId(id) {
        const [rows] = await db.query('SELECT * FROM usuario WHERE id = ?', [id]);
        return rows[0];
    }
    async listar(adminId) {
        const [rows] = await db.query('SELECT id, nome, email, papel FROM usuario WHERE id != ?', [adminId]);
        return rows;
    }
    async deletar(id) {
        const [result] = await db.query('DELETE FROM usuario WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}
module.exports = new UsuarioRepository();
