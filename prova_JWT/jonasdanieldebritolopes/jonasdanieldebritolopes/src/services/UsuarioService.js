const UsuarioRepository = require("../repositories/UsuarioRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
class UsuarioService {
  async login(email, senha) {
    if (!email || !senha) {
      throw new Error("E-mail e senha são obrigatórios");
    }
    const usuario = await UsuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new Error("Credenciais inválidas");
    }
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new Error("Credenciais inválidas");
    }
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, papel: usuario.papel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }

  async registrar(dadosUsuario) {
    const { nome, email, senha } = dadosUsuario;
    if (!nome || !email || !senha) {
      throw new Error("Nome, e-mail e senha são obrigatórios");
    }
    const usuarioExistente = await UsuarioRepository.buscarPorEmail(email);
    if (usuarioExistente) {
      throw new Error("E-mail já cadastrado");
    }
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    const id = await UsuarioRepository.criar({ nome, email, senha: senhaHash });
    return { id, nome, email };
  }

  async listar(adminId) {
    return await UsuarioRepository.listar(adminId);
  }
  async deletar(id) {
    const usuarioExistente = await UsuarioRepository.buscarPorId(id);
    if (!usuarioExistente) {
      throw new Error("Usuário não encontrado");
    }
    const deletado = await UsuarioRepository.deletar(id);
    if (!deletado) {
      throw new Error("Erro ao deletar usuário");
    }
    return { mensagem: "Usuário deletado com sucesso" };
  }
}

module.exports = new UsuarioService();
