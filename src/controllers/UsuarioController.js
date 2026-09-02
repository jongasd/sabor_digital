const UsuarioService = require("../services/UsuarioService");

class UsuarioController {
  // Cadastro público: sempre cria "cliente", mesmo que o corpo mande papel: "admin".
  async register(req, res, next) {
    try {
      const resultado = await UsuarioService.registrarUsuario(req.body, {
        permitirAdmin: false,
      });
      res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  // Cadastro de admin: só acessível por quem já é admin (rota protegida).
  async registerAdmin(req, res, next) {
    try {
      const resultado = await UsuarioService.registrarUsuario(
        { ...req.body, papel: "admin" },
        { permitirAdmin: true },
      );
      res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const resultado = await UsuarioService.login(email, senha);
      res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = new UsuarioController();
