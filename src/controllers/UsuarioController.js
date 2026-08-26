const UsuarioService = require('../services/UsuarioService');

class UsuarioController {
    async register(req, res) {
        try {
            const resultado = await UsuarioService.registrarUsuario(req.body);
            res.status(201).json(resultado);
        } catch (erro) {
            next(erro)
            };
        }
    
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            const resultado = await UsuarioService.login(email, senha);
            res.status(200).json(resultado);
        } catch (erro) {
            next(erro)
        }
    }
}
module.exports = new UsuarioController();