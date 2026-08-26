const UsuarioRepository = require("../repositories/UsuarioRepository");
const AppError = require("../middlewares/appError");

const CAMPOS_OBRIGATORIOS_CRIACAO = ["nome", "senha", "papel"];

const CAMPOS_ATUALIZAVEIS = ["nome", "senha"];

const parseId = (id) => {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError("ID inválido", 400);
  }
  return parsed;
};

const validarCamposObrigatorios = (dados) => {
  const faltando = CAMPOS_OBRIGATORIOS_CRIACAO.filter(
    (campo) =>
      dados[campo] === undefined ||
      dados[campo] === null ||
      dados[campo] === ""
  );

  if (faltando.length > 0) {
    throw new AppError(
      `Campos obrigatórios ausentes: ${faltando.join(", ")}`,
      400
    );
  }
};

const UsuarioService = {
  listarTodos: () => UsuarioRepository.findAll(),

  buscarPorId: async (id) => {
    const idValido = parseId(id);
    const usuario = await UsuarioRepository.findById(idValido);

    if (!usuario) {
      throw new AppError("Cliente não encontrado", 404);
    }

    return usuario;
  },
  buscarPorEmail: async (email) => {
    const emailValido = parseId(email);
    const usuario = await UsuarioRepository.findByEmail(idValido);

    if (!usuario) {
      throw new AppError("Usuario não encontrado", 404);
    }

    return usuario;
  },

  criar: async (body) => {
    validarCamposObrigatorios(body);

    const dados = {
      nome: String(body.nome).trim(),
      ativo: body.ativo !== undefined ? Number(body.ativo) : 1,
    };

    return await Cliente.create(dados);
  },
}
module.exports = UsuarioService;