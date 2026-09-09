const UsuarioService = require('../services/UsuarioService');
class UsuarioController {
    async registrar(req, res) {
        try {
            const usuario = await UsuarioService.registrar(req.body);
            res.status(201).json(usuario);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            const resultado = await UsuarioService.login(email, senha);
            res.json(resultado);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    async listar(req, res) {
        try {
            const adminId = req.usuarioId;
            const usuarios = await UsuarioService.listar(adminId);
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await UsuarioService.deletar(id);
            res.json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
module.exports = new UsuarioController();
