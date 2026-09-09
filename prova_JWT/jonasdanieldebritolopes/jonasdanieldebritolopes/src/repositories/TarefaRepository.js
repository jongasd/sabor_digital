const db = require('../config/database');
class TarefaRepository {
    async listarPorUsuarioId(usuarioId) {
        const [rows] = await db.query('SELECT * FROM tarefa WHERE usuario_id = ? ORDER BY criado_em DESC', [usuarioId]);
        return rows;
    }
    async criar(tarefa) {
        const { usuario_id, titulo, descricao } = tarefa;
        const [result] = await db.query(
            'INSERT INTO tarefa (usuario_id, titulo, descricao, status) VALUES (?, ?, ?, ?)',
            [usuario_id, titulo, descricao, 'pendente']
        );
        return result.insertId;
    }
    async atualizarStatus(id, usuarioId, status) {
        const [result] = await db.query(
            'UPDATE tarefa SET status = ? WHERE id = ? AND usuario_id = ?',
            [status, id, usuarioId]
        );
        return result.affectedRows > 0;
    }
    async deletar(id, usuarioId) {
        const [result] = await db.query(
            'DELETE FROM tarefa WHERE id = ? AND usuario_id = ?',
            [id, usuarioId]
        );
        return result.affectedRows > 0;
    }
}
module.exports = new TarefaRepository();
