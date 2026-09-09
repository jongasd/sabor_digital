const TarefaRepository = require('../repositories/TarefaRepository');
class TarefaService {
    async listar(usuarioId) {
        return await TarefaRepository.listarPorUsuarioId(usuarioId);
    }
    async criar(tarefa, usuarioId) {
        if (!tarefa.titulo) {
            throw new Error('O título da tarefa é obrigatório');
        }
        tarefa.usuario_id = usuarioId;
        const id = await TarefaRepository.criar(tarefa);
        return { id, ...tarefa, status: 'pendente' };
    }
    async atualizarStatus(id, usuarioId, status) {
        const statusPermitidos = ['pendente', 'em_andamento', 'concluida'];
        if (!statusPermitidos.includes(status)) {
            throw new Error('Status inválido');
        }
        const atualizado = await TarefaRepository.atualizarStatus(id, usuarioId, status);
        if (!atualizado) {
            throw new Error('Tarefa não encontrada ou você não tem permissão para editá-la');
        }
        return { mensagem: 'Status atualizado com sucesso' };
    }
    async deletar(id, usuarioId) {
        const deletado = await TarefaRepository.deletar(id, usuarioId);
        if (!deletado) {
            throw new Error('Tarefa não encontrada ou você não tem permissão para deletá-la');
        }
        return { mensagem: 'Tarefa deletada com sucesso' };
    }
}
module.exports = new TarefaService();
