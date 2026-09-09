const TarefaService = require('../services/TarefaService');
class TarefaController {
    async listar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const tarefas = await TarefaService.listar(usuarioId);
            res.json(tarefas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async criar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const tarefa = await TarefaService.criar(req.body, usuarioId);
            res.status(201).json(tarefa);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async atualizarStatus(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const { id } = req.params;
            const { status } = req.body;
            const resultado = await TarefaService.atualizarStatus(id, usuarioId, status);
            res.json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deletar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const { id } = req.params;
            const resultado = await TarefaService.deletar(id, usuarioId);
            res.json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
module.exports = new TarefaController();
